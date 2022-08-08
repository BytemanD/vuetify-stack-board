import abc
import json
import logging
from urllib import parse

from requests import exceptions
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
CONF_DB_API = None


class Index(web.RequestHandler):

    def get(self):
        self.redirect('/welcome')


class Dashboard(web.RequestHandler):

    def _select_cluster(self):
        cluster_id = self.get_cookie('clusterId')
        LOG.debug('cluster id in cookies is: %s', cluster_id)
        if cluster_id:
            return api.get_cluster_by_id(cluster_id)

        return None

    def _update_auth_token(self, cluster):
        global PROXY_MAP

        region = self.get_cookie('region')
        LOG.info('use region %s', region)
        identity = proxy.OpenstackV3AuthProxy(cluster.auth_url,
                                              cluster.auth_project,
                                              cluster.auth_user,
                                              cluster.auth_password,
                                              region=region)
        if not identity.is_connectable():
            raise exceptions.ConnectionError()
        identity.update_auth_token()
        PROXY_MAP[str(cluster.id)] = identity

    def get(self):
        cluster = self._select_cluster()
        if not cluster:
            self.redirect('/welcome')
            return

        try:
            self._update_auth_token(cluster)
        except exceptions.ConnectionError:
            LOG.error(f'Connect to {cluster.name} failed')
            self.redirect('/welcome')
            return
        except Exception as e:
            LOG.exception(e)
            self.set_status(500)
            self.finish({'error': e})
            return

        if CONF.use_cdn:
            cdn = constants.CDN
        else:
            cdn = {k: '/static/cdn' for k in constants.CDN}
        self.render('dashboard.html', name='VStackBoard', cdn=cdn,
                    cluster=cluster.name)


class Welcome(web.RequestHandler):

    def get(self):
        if CONF.use_cdn:
            cdn = constants.CDN
        else:
            cdn = {k: '/static/cdn' for k in constants.CDN}
        self.render('welcome.html', cdn=cdn, version=utils.get_version())


class Configs(web.RequestHandler):

    def get(self):
        global CONF_DB_API

        self.set_status(200)
        self.finish({'configs': [
            item.to_dict() for item in CONF_DB_API.list()]
        })


class Cluster(web.RequestHandler):

    def get(self):
        cluster_list = api.query_cluster()
        self.set_status(200)
        self.finish({
            'clusters': [cluster.to_dict() for cluster in cluster_list]
        })

    def post(self):
        data = json.loads(self.request.body)
        cluster = data.get('cluster', {})
        LOG.debug('add cluster: %s', data)
        try:
            identity = proxy.OpenstackV3AuthProxy(cluster.get('authUrl'),
                                                  cluster.get('authProject'),
                                                  cluster.get('authUser'),
                                                  cluster.get('authPassword'))
            identity.update_auth_token()
            api.create_cluster(cluster.get('name'), cluster.get('authUrl'),
                               cluster.get('authProject'),
                               cluster.get('authUser'),
                               cluster.get('authPassword'))
            self.set_status(200)
            self.finish(json.dumps({}))
        except Exception as e:
            self.set_status(400)
            self.finish({'error': str(e)})

    def delete(self, cluster_id):
        deleted = api.delete_cluster_by_id(cluster_id)
        if deleted >= 1:
            self.set_status(204)
            self.finish()
            return
        else:
            self.set_status(404)
            self.finish({'error': f'cluster {cluster_id} is not found'})


class OpenstackProxyBase(web.RequestHandler):

    def _get_proxy(self) -> proxy.OpenstackV3AuthProxy:
        global PROXY_MAP

        if self.get_cookie('clusterId') not in PROXY_MAP:
            cluster = api.get_cluster_by_id(self.get_cookie('clusterId'))
            identity = proxy.OpenstackV3AuthProxy(cluster.auth_url,
                                                  cluster.auth_project,
                                                  cluster.auth_user,
                                                  cluster.auth_password)
            identity.update_auth_token()
            PROXY_MAP[self.get_cookie('clusterId')] = identity
        return PROXY_MAP[self.get_cookie('clusterId')]

    def _request_body(self):
        return None if self.request.method.upper() in ['DELETE', 'GET'] else \
            self.request.body

    @abc.abstractmethod
    def get_proxy_method(self, proxy_driver: proxy.OpenstackV3AuthProxy):
        raise ImportError()

    def do_proxy(self, method, url):
        cluster_proxy = self._get_proxy()
        query = parse.urlparse(self.request.uri).query
        if query:
            url += f'?{query}'
        resp = self.get_proxy_method(cluster_proxy)(
            method=method, url=url, data=self._request_body())
        self.set_status(resp.status_code, resp.reason)
        if resp.status_code in [204]:
            self.finish()
        else:
            self.finish(resp.content)

    def get(self, url):
        self.do_proxy('GET', url)

    def post(self, url):
        self.do_proxy('POST', url)

    def put(self, url):
        self.do_proxy('PUT', url)

    def delete(self, url):
        self.do_proxy('DELETE', url)


class KeystoneProxy(OpenstackProxyBase):

    def get_proxy_method(self, proxy_driver: proxy.OpenstackV3AuthProxy):
        return proxy_driver.proxy_keystone


class NovaProxy(OpenstackProxyBase):
    def get_proxy_method(self, proxy_driver: proxy.OpenstackV3AuthProxy):
        return proxy_driver.proxy_nova


class GlanceProxy(OpenstackProxyBase):
    def get_proxy_method(self, proxy_driver: proxy.OpenstackV3AuthProxy):
        return proxy_driver.proxy_glance


class CinderProxy(OpenstackProxyBase):
    def get_proxy_method(self, proxy_driver: proxy.OpenstackV3AuthProxy):
        return proxy_driver.proxy_cinder


class NeutronProxy(OpenstackProxyBase):
    def get_proxy_method(self, proxy_driver: proxy.OpenstackV3AuthProxy):
        return proxy_driver.proxy_neutron
