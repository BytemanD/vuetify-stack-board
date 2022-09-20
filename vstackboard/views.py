import abc
import json
import logging
import re
import threading
from urllib import parse

from tornado import web

from vstackboard.common import conf
from vstackboard.common import constants
from vstackboard.common import context
from vstackboard.common import exceptions
from vstackboard.common import utils
from vstackboard.db import api
from vstackboard.openstack import proxy

LOG = logging.getLogger(__name__)
CONF = conf.CONF

CONF_DB_API = None

UPLOADING_IMAGES = {}
UPLOADING_THREADS = {}


class Index(web.RequestHandler):

    def get(self):
        self.redirect('/welcome')


class BaseReqHandler(web.RequestHandler):

    def _get_context(self):
        return context.ClusterContext(self.get_cookie('clusterId'),
                                      region=self.get_cookie('region'))


class Dashboard(BaseReqHandler):

    def get(self):
        ctxt = self._get_context()
        if not ctxt.cluster_id:
            self.redirect('/welcome')
            return

        if not ctxt.cluster:
            LOG.debug('cluster %s is not exists', ctxt.cluster_id)
            self.redirect('/welcome')

        LOG.info('region is %s', ctxt.region)
        try:
            cluster_proxy = proxy.OpenstackV3AuthProxy(
                ctxt.cluster.auth_url, ctxt.cluster.auth_project,
                ctxt.cluster.auth_user, ctxt.cluster.auth_password,
                region=ctxt.region)
            if not cluster_proxy.is_connectable():
                LOG.warn('Connect to cluster %s failed', ctxt.cluster_id)
                self.redirect('/welcome')
        except Exception as e:
            LOG.exception(e)
            self.set_status(500)
            self.finish({'error': e})
            return

        cdn = CONF.use_cdn and constants.CDN or {
            k: '/static/cdn' for k in constants.CDN}
        self.render('dashboard.html', name='VStackBoard', cdn=cdn,
                    cluster=ctxt.cluster.name)


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
        else:
            self.set_status(404)
            self.finish({'error': f'cluster {cluster_id} is not found'})
        return


class Tasks(web.RequestHandler):

    def _get_uploading_tasks(self):
        global UPLOADING_IMAGES, UPLOADING_THREADS

        uploading_tasks = []
        for url, image_chunk in UPLOADING_IMAGES.items():
            matched = re.match(r'.*/images/(.*)/file', url)
            if not matched:
                LOG.warning('image id not matched for url %s', url)
                continue
            image_id = matched.group(1)
            uploading_tasks.append({'image_id': image_id,
                                    'size': image_chunk.size,
                                    'cached': image_chunk.cached_percent(),
                                    'readed': image_chunk.readed_percent()})
        return uploading_tasks

    def get(self):
        global UPLOADING_IMAGES
        tasks = {}
        try:
            tasks['uploading'] = self._get_uploading_tasks()
            self.set_status(201)
            self.finish({'tasks': tasks})
        except Exception as e:
            self.set_status(400)
            self.finish({'error': str(e)})


class GetContext(object):

    def _get_context(self):
        return context.ClusterContext(self.get_cookie('clusterId'),
                                      region=self.get_cookie('region'))

    def _get_header_value(self, header):
        for h, v in self.request.headers.get_all():
            if h == header:
                return v


class AuthInfo(web.RequestHandler, GetContext):

    def get(self):
        context = self._get_context()
        cluster_proxy = proxy.get_proxy(context)
        cluster_proxy.get_project_id()
        self.set_status(200)
        self.finish({
            'auth_info': {
                'project': cluster_proxy.get_project(),
                'user': cluster_proxy.get_user(),
            }
        })


class OpenstackProxyBase(web.RequestHandler, GetContext):

    def _request_body(self):
        return None if self.request.method.upper() in ['DELETE', 'GET'] else \
            self.request.body

    @abc.abstractmethod
    def get_proxy_method(self, proxy_driver: proxy.OpenstackV3AuthProxy):
        raise ImportError()

    def _get_proxy_headers(self):
        proxy_headers = {}
        for header in ['Content-Type']:
            header_value = self._get_header_value(header)
            if header_value:
                proxy_headers[header] = header_value
        return proxy_headers

    def do_proxy(self, method, url):
        LOG.debug('do proxy  %s %s', method, url)
        context = self._get_context()
        try:
            cluster_proxy = proxy.get_proxy(context)
            query = parse.urlparse(self.request.uri).query
            if query:
                url += f'?{query}'
            proxy_headers = self._get_proxy_headers()
            resp = self.get_proxy_method(cluster_proxy)(
                method=method, url=url, data=self._request_body(),
                headers=proxy_headers)
            self.set_status(resp.status_code, resp.reason)
            if resp.status_code in [204]:
                self.finish()
            else:
                self.finish(resp.content)
        except exceptions.EndpointNotFound as e:
            self.set_status(404)
            self.finish({'error': str(e)})
            return
        except Exception as e:
            LOG.exception(e)
            self.set_status(500)
            self.finish({'error': str(e)})
            return

    def get(self, url):
        self.do_proxy('GET', url)

    def post(self, url):
        self.do_proxy('POST', url)

    def put(self, url):
        self.do_proxy('PUT', url)

    def delete(self, url):
        self.do_proxy('DELETE', url)

    def patch(self, url):
        self.do_proxy('PATCH', url)


class KeystoneProxy(OpenstackProxyBase):

    def get_proxy_method(self, proxy_driver: proxy.OpenstackV3AuthProxy):
        return proxy_driver.proxy_keystone


class NovaProxy(OpenstackProxyBase):

    def get_proxy_method(self, proxy_driver: proxy.OpenstackV3AuthProxy):
        return proxy_driver.proxy_nova


class GlanceProxy(OpenstackProxyBase):

    def get_proxy_method(self, proxy_driver: proxy.OpenstackV3AuthProxy):
        return proxy_driver.proxy_glance

    def is_upload_file(self):
        return self.request.method.upper() == 'PUT' and \
            re.match(r'/(.*)/images/(.*)/file', self.request.uri) is not None

    def proxy_glance_upload(self, url):
        global UPLOADING_IMAGES, UPLOADING_THREADS

        cluster_proxy = proxy.get_proxy(self._get_context())

        if url not in UPLOADING_IMAGES:
            image_chunk = utils.ImageChunk(
                self.request.headers.get('x-image-meta-size'))
            UPLOADING_IMAGES[url] = image_chunk

            LOG.info('image %s start thread %s', url, image_chunk.size)
            upload_thread = threading.Thread(
                target=cluster_proxy.proxy_glance_upload,
                args=(url, image_chunk))
            upload_thread.setDaemon(True)
            upload_thread.start()
            UPLOADING_THREADS[url] = upload_thread

        else:
            image_chunk = UPLOADING_IMAGES[url]

        content_length = self.request.headers.get('Content-Length')
        LOG.info('image %s add chunk, size=%s', url, content_length)
        image_chunk.add(self.request.body, content_length)

        if image_chunk.all_cached() and url in UPLOADING_IMAGES:
            LOG.info('image %s all cached, waitting for upload', url)
            # NOTE: do not wait for uploading, because it can take a long time.
            # UPLOADING_THREADS.get(url).join()
            del UPLOADING_THREADS[url]
            del UPLOADING_IMAGES[url]

        self.set_status(204)
        self.finish()

    def put(self, url):
        if self.is_upload_file():
            # self.do_proxy('PUT', url)
            self.proxy_glance_upload(url)
        else:
            self.do_proxy('PUT', url)


class CinderProxy(OpenstackProxyBase):

    def get_proxy_method(self, proxy_driver: proxy.OpenstackV3AuthProxy):
        return proxy_driver.proxy_cinder


class NeutronProxy(OpenstackProxyBase):

    def get_proxy_method(self, proxy_driver: proxy.OpenstackV3AuthProxy):
        return proxy_driver.proxy_neutron
