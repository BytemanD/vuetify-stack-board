from functools import lru_cache
from skylight.common import log
import time
import json
from urllib import parse
import requests

from skylight.common import conf
from skylight.common import constants
from skylight.common import exceptions

LOG = log.getLogger()
CONF = conf.CONF


class OpenstackKeystoneV3Auth(object):

    def __init__(self, auth_url, auth_user, auth_project, auth_password,
                 domain_name, region=None) -> None:
        self.auth_url = auth_url
        self.auth_token = {}
        self.auth_user = auth_user
        self.auth_project = auth_project
        self.auth_password = auth_password
        self.domain_name = domain_name
        self.region = region or 'RegionOne'
        self.endpoints = {}
        self._micro_versions = {}

    @property
    def auth_body(self):
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

    def _update_endpoints(self, token: dict):
        for service in token.get('catalog', []):
            for endpoint in service.get('endpoints', []):
                if endpoint.get('interface') != 'public' \
                   or self.region and endpoint.get('region') != self.region:
                    continue
                self.endpoints[service.get('name')] = endpoint.get('url')
                break

    def update_auth_token(self, fetch_max_version=False):
        LOG.debug('auth body: {}', self.auth_body)
        resp = requests.post(parse.urljoin(self.auth_url, '/v3/auth/tokens'),
                             json=self.auth_body, timeout=60)
        token = json.loads(resp.content).get('token', {})
        self.auth_token = {
            'token': resp.headers.get('x-subject-token', None),
            'expires_at': time.time() + CONF.openstack.expires_time,
            'project': token.get('project', {}),
            'user': token.get('user', {})}
        if not self.auth_token.get('token'):
            raise RuntimeError('auth faield')
        self._catalog = token.get('catalog', [])

        self._update_endpoints(token)
        LOG.debug('endpoints {}', self.endpoints)
        LOG.debug('update auth token success, expires_at {},  token is {}',
                  self.auth_token.get('expires_at'),
                  self.auth_token.get('token'))

        if fetch_max_version:
            if 'compute' not in self._micro_versions and \
               CONF.openstack.fetch_max_version:
                self._micro_versions['compute'] = \
                    self.get_compute_max_version()
        LOG.info('micro versions: {}', self._micro_versions)

    def get_token(self) -> str:
        if 'token' not in self.auth_token or \
           time.time() >= self.auth_token.get('expires_at'):
            self.update_auth_token(
                fetch_max_version=CONF.openstack.fetch_max_version)
        return self.auth_token.get('token')

    @lru_cache
    def get_endpoint(self, service, defualt_version=None):
        # sourcery skip: reintroduce-else, swap-if-else-branches,
        # use-named-expression
        endpoint = self.endpoints.get(service)
        if not endpoint:
            raise exceptions.EndpointNotFound(service=service,
                                              region=self.region)
        if endpoint.endswith('/'):
            endpoint = endpoint[:-1]
        if not constants.REG_API_VERSION.match(endpoint):
            if not defualt_version:
                LOG.warning('{} endpoint({}) not contains api version',
                            service, endpoint)
            else:
                endpoint = parse.urljoin(endpoint, defualt_version)
        return endpoint

    def get_compute_max_version(self):
        headers = {}
        self.auth_request(headers)
        resp = requests.request('GET', self.get_endpoint('nova'),
                                headers=headers)
        resp.raise_for_status()
        return resp.json().get('version', {}).get('version')

    def auth_request(self, headers: dict):
        headers['X-Auth-Token'] = self.get_token()
