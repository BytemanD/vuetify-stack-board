from functools import lru_cache
import logging
import re
import time
import json
from urllib import parse
import requests

from skylight.common import conf
from skylight.common import context
from skylight.common import exceptions
from skylight.common.db import api
LOG = logging.getLogger(__name__)
CONF = conf.CONF

PROXY_MAP = {}
REG_API_VERSION = re.compile(r'.*/v[\d.]')


class OpenstackV3AuthProxy(object):

    def __init__(self, auth_url, auth_project, auth_user, auth_password,
                 domain_name=None, region=None):
        self.auth_url = auth_url
        self.auth_project = auth_project
        self.auth_user = auth_user
        self.auth_password = auth_password
        self.domain_name = domain_name or 'Default'

        self.auth_body = self._get_auth_body()
        self.auth_token = {}
        self.endpoints = {}
        self._api_version = None
        self.region = region

    def get_token(self):
        if 'token' not in self.auth_token or \
           time.time() >= self.auth_token.get('expires_at'):
            self.update_auth_token()
        return self.auth_token.get('token')

    def get_project_id(self):
        if 'project' not in self.auth_token:
            self.update_auth_token()
        return self.auth_token.get('project', {}).get('id')

    def get_project(self):
        if 'project' not in self.auth_token:
            self.update_auth_token()
        return self.auth_token.get('project', {})

    def get_user(self):
        if 'user' not in self.auth_token:
            self.update_auth_token()
        return self.auth_token.get('user', {})

    def is_connectable(self):
        try:
            requests.get(self.auth_url, timeout=5)
            return True
        except requests.exceptions.ConnectionError:
            return False

    def update_auth_token(self, fetch_max_version=True):
        auth_body = self._get_auth_body()
        LOG.debug('auth body: %s', auth_body)
        resp = requests.post(parse.urljoin(self.auth_url, '/v3/auth/tokens'),
                             json=auth_body, timeout=60)
        token = json.loads(resp.content).get('token', {})
        self.auth_token = {
            'token': resp.headers.get('x-subject-token', None),
            'expires_at': time.time() + CONF.openstack.expires_time,
            'project': token.get('project', {}),
            'user': token.get('user', {})}
        if not self.auth_token.get('token'):
            raise RuntimeError('auth faield')
        self._update_endpoints(token)
        LOG.debug('Endpoints %s', self.endpoints)
        LOG.debug('Update auth token success, expires_at %s,  token is %s',
                  self.auth_token.get('expires_at'),
                  self.auth_token.get('token'))

        if fetch_max_version:
            if 'compute' not in CONF.openstack.api_version and \
                    CONF.openstack.fetch_max_version:
                CONF.openstack.api_version['compute'] = \
                    self.get_compute_max_version()

    @lru_cache
    def _get_endpoint(self, service, defualt_api_version=None):
        # sourcery skip: reintroduce-else, swap-if-else-branches,
        # use-named-expression
        endpoint = self.endpoints.get(service)
        if not endpoint:
            raise exceptions.EndpointNotFound(service=service,
                                              region=self.region)
        if endpoint.endswith('/'):
            endpoint = endpoint[:-1]
        if not REG_API_VERSION.match(endpoint):
            if not defualt_api_version:
                LOG.warning('%s endpoint(%s) not container api version',
                            service, endpoint)
            else:
                endpoint = parse.urljoin(endpoint, defualt_api_version)
        return endpoint

    def _update_endpoints(self, token):
        for service in token.get('catalog', []):
            for endpoint in service.get('endpoints', []):
                if endpoint.get('interface') != 'public' \
                   or self.region and endpoint.get('region') != self.region:
                    continue
                self.endpoints[service.get('name')] = endpoint.get('url')
                break

    def _get_auth_body(self):
        return {
            "auth": {
                "identity": {
                    "methods": ["password"],
                    "password": {
                        "user": {
                            "name": self.auth_user,
                            "domain": {"name": self.domain_name},
                            "password": self.auth_password
                        }
                    }
                },
                "scope": {
                    "project": {
                        "domain": {"id": "default"},
                        "name": self.auth_project
                    }
                }
            }
        }

    def _request_uri(self, request):
        return f'{self.proxy_to}{request.uri.split(self.url_replace, 1)[1]}'

    def _request_body(self, request):
        return None if request.method.upper() in ['DELETE', 'GET'] else \
            request.body

    def _get_api_version(self):
        if not self._api_version:
            self._api_version = ','.join(
                [f'{k} {v}' for k, v in CONF.openstack.api_version.items()
                    if v is not None]
            )

            LOG.info('api version: %s', self._api_version)
        return self._api_version

    def get_compute_max_version(self):
        try:
            resp = requests.request('GET', self._get_endpoint('nova'),
                                    headers=self.get_header())
            return resp.json().get('version', {}).get('version')
        except Exception:
            raise

    def get_header(self):
        headers = {'X-Auth-Token': self.get_token(),
                   'Content-Type': 'application/json'}
        api_version = self._get_api_version()
        if api_version:
            headers['OpenStack-API-Version'] = api_version
        return headers

    def proxy_keystone(self, method='GET', url=None, data=None, headers=None):
        endpoint = self._get_endpoint(
            'keystone', defualt_api_version=CONF.openstack.keystone_api_version)
        proxy_url = f"{endpoint}{url or '/'}"
        return self._proxy_openstack(method, proxy_url, data=data,
                                     headers=headers)

    def proxy_nova(self, method='GET', url=None, data=None, headers=None):
        endpoint = self._get_endpoint(
            'nova', defualt_api_version=CONF.openstack.nova_api_version)
        proxy_url = f"{endpoint}{url or '/'}"
        return self._proxy_openstack(method, proxy_url, data=data,
                                     headers=headers)

    def proxy_glance_upload(self, url, image_chunk):
        headers = self.get_header()
        headers.update({'Content-Type': 'application/octet-stream'})

        LOG.info('uploading image %s', url)
        resp = requests.put(f"{self._get_endpoint('glance')}{url or '/'}",
                            headers=headers, data=image_chunk)
        LOG.info('uploaded image %s', url)
        return resp

    def proxy_glance(self, method='GET', url=None, data=None, headers=None):
        endpoint = self._get_endpoint(
            'glance', defualt_api_version=CONF.openstack.glance_api_version)
        proxy_url = f"{endpoint }{url or '/'}"
        return self._proxy_openstack(method, proxy_url, data=data,
                                     headers=headers)

    def proxy_neutron(self, method='GET', url=None, data=None, headers=None):
        endpoint = self._get_endpoint(
            'neutron', defualt_api_version=CONF.openstack.neutron_api_version)
        proxy_url = f"{endpoint}{url or '/'}"
        return self._proxy_openstack(method, proxy_url, data=data,
                                     headers=headers)

    def proxy_cinder(self, method='GET', url=None, data=None, headers=None):
        proxy_url = f"{self._get_endpoint('cinderv2')}{url or '/'}"
        return self._proxy_openstack(method, proxy_url, data=data,
                                     headers=headers)

    def _proxy_openstack(self, method, proxy_url, data=None, headers=None):
        proxy_headers = self.get_header()
        if headers:
            proxy_headers.update(headers)
        return requests.request(method, proxy_url, data=data,
                                headers=proxy_headers)


def get_proxy(ctxt: context.RequestContext) -> OpenstackV3AuthProxy:
    global PROXY_MAP

    if ctxt.cluster_id not in PROXY_MAP or \
       not PROXY_MAP[ctxt.cluster_id].get(ctxt.region):

        cluster = api.get_cluster_by_id(ctxt.cluster_id)
        cluster_proxy = OpenstackV3AuthProxy(cluster.auth_url,
                                             cluster.auth_project,
                                             cluster.auth_user,
                                             cluster.auth_password,
                                             region=ctxt.region)
        cluster_proxy.update_auth_token()
        PROXY_MAP.setdefault(ctxt.cluster_id, {})
        PROXY_MAP[ctxt.cluster_id][ctxt.region] = cluster_proxy

    return PROXY_MAP[ctxt.cluster_id][ctxt.region]
