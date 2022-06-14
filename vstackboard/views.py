import json
import logging

from tornado import web

from vstackboard.common import conf
from vstackboard.common import constants
from vstackboard.common import utils
from vstackboard.db import api
from vstackboard.openstack import proxy


LOG = logging.getLogger(__name__)
CONF = conf.CONF

PROXY = None

PROXY_MAP = {}


class Index(web.RequestHandler):

    def get(self):
        self.redirect('/dashboard')


class Dashboard(web.RequestHandler):

    def _select_cluster(self):
        cluster_name = self.get_cookie('envName')
        LOG.debug('envName in cookies is: %s', cluster_name)

        if cluster_name:
            self._update_auth_token(api.get_env_by_name(cluster_name))
            return cluster_name

        clusters = api.query_env()
        LOG.debug('clusters in db: %s', clusters)
        if clusters:
            self._update_auth_token(clusters[0])
            return clusters[0].name

        return None

    def _update_auth_token(self, cluster):
        global PROXY_MAP
        identity = proxy.OpenstackV3AuthProxy(cluster.auth_url,
                                              cluster.auth_project,
                                              cluster.auth_user,
                                              cluster.auth_password)
        identity.update_auth_token()
        PROXY_MAP[cluster.name] = identity

    def get(self):
        cluster_name = None
        try:
            cluster_name = self._select_cluster()
            self.set_cookie('envName', cluster_name)
        except Exception as e:
            LOG.exception(e)

        if not cluster_name:
            self.redirect('/welcome')
            return

        if CONF.use_cdn:
            cdn = constants.CDN
        else:
            cdn = {k: '/static/cdn' for k in constants.CDN}
        self.render('dashboard.html', name='VStackBoard', cdn=cdn,
                    cluster=cluster_name)


class Welcome(web.RequestHandler):

    def get(self):
        if CONF.use_cdn:
            cdn = constants.CDN
        else:
            cdn = {k: '/static/cdn' for k in constants.CDN}
        self.render('welcome.html', cdn=cdn, version=utils.get_version())


class Config(web.RequestHandler):

    def get(self):
        self.set_status(200)
        self.finish({})


class Environment(web.RequestHandler):

    def get(self):
        self.set_status(200)
        env_list = api.query_env()
        self.finish({'envs': [env.to_dict() for env in env_list]})

    def post(self):
        data = json.loads(self.request.body)
        env = data.get('env', {})
        LOG.debug('add env: %s', data)
        try:
            identity = proxy.OpenstackV3AuthProxy(env.get('authUrl'),
                                                  env.get('authProject'),
                                                  env.get('authUser'),
                                                  env.get('authPassword'))
            identity.update_auth_token()
            api.create_env(env.get('name'), env.get('authUrl'),
                           env.get('authProject'), env.get('authUser'),
                           env.get('authPassword'))
            self.set_status(200)
            self.set_cookie('envName', env.get('name'))
            self.finish(json.dumps({}))
        except Exception as e:
            self.set_status(400)
            self.finish({'error': e})


class OpenstackProxy(web.RequestHandler):

    def prepare(self):
        global PROXY_MAP

        if self.get_cookie('envName') not in PROXY_MAP:
            cluster = api.get_env_by_name(self.get_cookie('envName'))
            identity = proxy.OpenstackV3AuthProxy(cluster.auth_url,
                                                  cluster.auth_project,
                                                  cluster.auth_user,
                                                  cluster.auth_password)
            identity.update_auth_token()
            PROXY_MAP[cluster.name] = identity

        cluster_proxy = PROXY_MAP[self.get_cookie('envName')]
        resp = cluster_proxy.proxy_reqeust(self.request)
        self.set_status(resp.status_code, resp.reason)
        if resp.status_code in [204]:
            self.finish()
        else:
            self.finish(resp.content)
