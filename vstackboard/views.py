import abc
import json
import logging
import re
import threading
from urllib.parse import urlparse

from tornado import web
from easy2use.web import application

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

RUN_AS_CONTAINER = False


class GetContext(object):

    def _get_context(self):
        req_context = context.RequestContext(
            self._get_header('X-Cluster-Id'),
            region=self._get_header('X-Region')
        )
        LOG.debug('context: %s', req_context)
        if not req_context.cluster_id:
            raise exceptions.ApiException(
                400, 'cluster id is none')
        return req_context

    def _get_header(self, header):
        return self.request.headers.get(header)


class BaseReqHandler(application.BaseReqHandler, GetContext):
    pass


class Version(BaseReqHandler):

    def get(self):
        self.set_status(200)
        self.finish({'version': utils.get_version()})


class Configs(BaseReqHandler):

    def get(self):
        global CONF_DB_API

        self.set_status(200)
        self.finish({'configs': [
            item.to_dict() for item in CONF_DB_API.list()]
        })


class Cluster(BaseReqHandler):

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
            LOG.exception(e)
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


class Tasks(BaseReqHandler):

    def _get_uploading_tasks(self):
        uploading_tasks = []
        for image_chunk in api.query_image_chunk():
            data = {'id': image_chunk.id,
                    'image_id': image_chunk.image_id, 'size': image_chunk.size,
                    'cached': image_chunk.cached * 100 / image_chunk.size,
                    'readed': image_chunk.readed * 100 / image_chunk.size}
            uploading_tasks.append(data)
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

    def delete(self, task_id):
        try:
            api.delete_image_chunk(task_id)
            self.set_status(204)
            self.finish()
        except Exception:
            LOG.exception('delete image chunk %s faield', task_id)
            self.set_status(400)
            self.finish()


class AuthInfo(BaseReqHandler):

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


class OpenstackProxyBase(BaseReqHandler, GetContext):

    def _request_body(self):
        return None if self.request.method.upper() in ['DELETE', 'GET'] else \
            self.request.body

    @abc.abstractmethod
    def get_proxy_method(self, proxy_driver: proxy.OpenstackV3AuthProxy):
        raise ImportError()

    def _get_proxy_headers(self):
        # sourcery skip: extract-method, use-named-expression
        proxy_headers = {}
        for header in ['Content-Type']:
            header_value = self._get_header(header)
            if header_value:
                proxy_headers[header] = header_value
        return proxy_headers

    def do_proxy(self, method, url):
        # sourcery skip: extract-method, use-named-expression
        LOG.debug('do proxy  %s %s', method, url)
        context = self._get_context()

        if not context.cluster_id:
            return 400, {'message': 'Cluster id not found in context'}

        try:
            cluster_proxy = proxy.get_proxy(context)
            query = urlparse(self.request.uri).query
            if query:
                url += f'?{query}'
            proxy_headers = self._get_proxy_headers()
            for i in range(2):
                resp = self.get_proxy_method(cluster_proxy)(
                    method=method, url=url, data=self._request_body(),
                    headers=proxy_headers)
                if resp.status_code == 401 and i == 0:
                    logging.warning("Unauthorized, headers: %s, update auth "
                                    "token", cluster_proxy.get_header())
                    cluster_proxy.update_auth_token(fetch_max_version=False)
                    logging.debug("new headers: %s",
                                    cluster_proxy.get_header())
                    continue
                break
            return resp.status_code, resp.content
        except exceptions.EndpointNotFound as e:
            return 404, {'error': str(e)}

    @utils.with_response()
    def get(self, url):
        return self.do_proxy('GET', url)

    @utils.with_response(return_code=202)
    def post(self, url):
        return self.do_proxy('POST', url)

    @utils.with_response(return_code=202)
    def put(self, url):
        return self.do_proxy('PUT', url)

    @utils.with_response(return_code=204)
    def delete(self, url):
        return self.do_proxy('DELETE', url)

    @utils.with_response()
    def patch(self, url):
        return self.do_proxy('PATCH', url)


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

    def _get_image_chunck(self, url):
        # sourcery skip: assign-if-exp, extract-method,
        # inline-immediately-returned-variable
        global UPLOADING_IMAGES

        if url not in UPLOADING_IMAGES:
            image_chunk = utils.ImageChunk(
                url, self.request.headers.get('x-image-meta-size'))
            UPLOADING_IMAGES[url] = image_chunk

            LOG.info('image %s start thread %s', url, image_chunk.size)
            cluster_proxy = proxy.get_proxy(self._get_context())
            upload_thread = threading.Thread(
                target=cluster_proxy.proxy_glance_upload,
                args=(url, image_chunk))
            upload_thread.setDaemon(True)
            upload_thread.start()
        else:
            image_chunk = UPLOADING_IMAGES[url]
        return image_chunk

    def proxy_glance_upload(self, url):
        image_chunk = self._get_image_chunck(url)
        content_length = self.request.headers.get('Content-Length')
        LOG.info('image %s add chunk, size=%s', url, content_length)
        image_chunk.add(self.request.body, int(content_length))
        api.add_image_chunk_cached(image_chunk.image_id, int(content_length))

        if image_chunk.all_cached() and url in UPLOADING_IMAGES:
            LOG.info('image %s all cached, waitting for upload', url)

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


class Actions(web.RequestHandler, GetContext):

    def check_update(self):
        global RUN_AS_CONTAINER

        if RUN_AS_CONTAINER:
            LOG.info('Check latest image version')
            last_version = utils.check_last_image_version()
        else:
            LOG.info('Check latest wheel version')
            last_version = utils.check_last_version()
        self.set_status(200)
        self.finish({'checkLastVersion': last_version or {}})

    def post(self):
        data = json.loads(self.request.body)
        LOG.debug('action body: %s', data)
        if 'checkLastVersion' in data:
            self.check_update()



class ConfigJson(BaseReqHandler):

    @utils.with_response(return_code=202)
    def get(self):
        self.render(self.request.path[1:])


def get_routes():
    return [
        (r'/config.json', ConfigJson),
        (r'/version', Version),
        (r'/configs', Configs),
        (r'/cluster', Cluster),
        (r'/cluster/(.*)', Cluster),
        (r'/tasks', Tasks),
        (r'/tasks/(.*)', Tasks),
        (r'/identity(.*)', KeystoneProxy),
        (r'/computing(.*)', NovaProxy),
        (r'/image(.*)', GlanceProxy),
        (r'/networking(.*)', NeutronProxy),
        (r'/volume(.*)', CinderProxy),
        (r'/auth_info', AuthInfo),
        (r'/actions', Actions),
    ]
