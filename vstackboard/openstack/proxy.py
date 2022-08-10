import logging
import time
import json
import requests

from vstackboard.common import conf
from vstackboard.common import context
from vstackboard.common import exceptions
from vstackboard.db import api

LOG = logging.getLogger(__name__)
CONF = conf.CONF

PROXY_MAP = {}


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

    def is_connectable(self):
        try:
            requests.get(self.auth_url, timeout=5)
            return True
        except requests.exceptions.ConnectionError:
            return False

    def update_auth_token(self):
        LOG.info('auth body: %s', json.dumps(self.auth_body))
        resp = requests.post('{}/v3/auth/tokens'.format(self.auth_url),
                             json=self.auth_body,
                             timeout=10)
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
        LOG.debug('Update auth token success')

        if 'compute' not in CONF.openstack.api_version and \
                CONF.openstack.fetch_max_version:
            CONF.openstack.api_version['compute'] = \
                self.get_compute_max_version()

    def _get_endpoint(self, service):
        endpoint = self.endpoints.get(service)
        if not endpoint:
            raise exceptions.EndpointNotFound(service=service,
                                              region=self.region)
        return endpoint

    def _update_endpoints(self, token):
        for service in token.get('catalog', []):
            for endpoint in service.get('endpoints', []):
                if endpoint.get('interface') != 'public':
                    continue
                if self.region and endpoint.get('region') != self.region:
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
        return '{}{}'.format(
            self.proxy_to, request.uri.split(self.url_replace, 1)[1])

    def _request_body(self, request):
        return None if request.method.upper() in ['DELETE', 'GET'] else \
            request.body

    def _get_api_version(self):
        if not self._api_version:
            self._api_version = ','.join([
                '{} {}'.format(k, v) for k, v in
                CONF.openstack.api_version.items()])

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
        return {'X-Auth-Token': self.get_token(),
                'Content-Type': 'application/json',
                'OpenStack-API-Version': self._get_api_version()}

    def proxy_keystone(self, method='GET', url=None, data=None):
        proxy_url = '{}{}'.format(self._get_endpoint('keystone'), url or '/')
        return requests.request(method, proxy_url, data=data,
                                headers=self.get_header())

    def proxy_nova(self, method='GET', url=None, data=None):
        proxy_url = '{}{}'.format(self._get_endpoint('nova'), url or '/')
        return requests.request(method, proxy_url, data=data,
                                headers=self.get_header())

    def proxy_glance(self, method='GET', url=None, data=None):
        proxy_url = '{}{}'.format(self._get_endpoint('glance'), url or '/')
        return requests.request(method, proxy_url, data=data,
                                headers=self.get_header())

    def proxy_neutron(self, method='GET', url=None, data=None):
        proxy_url = '{}{}'.format(self._get_endpoint('neutron'), url or '/')
        return requests.request(method, proxy_url, data=data,
                                headers=self.get_header())

    def proxy_cinder(self, method='GET', url=None, data=None):
        proxy_url = '{}{}'.format(self._get_endpoint('cinderv2'), url or '/')
        return requests.request(method, proxy_url, data=data,
                                headers=self.get_header())


def get_proxy(ctxt: context.ClusterContext) -> OpenstackV3AuthProxy:
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
