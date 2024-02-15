from functools import lru_cache
from skylight.common import log
import time
import json
from urllib import parse
import requests

from skylight.common import conf
from skylight.common import exceptions

LOG = log.getLogger()
CONF = conf.CONF


class Endpoint(object):

    def __init__(self, url, default_version=None) -> None:
        parsed = parse.urlparse(url)
        if not parsed.path or parsed.path == '/':
            path = parse.urljoin(parsed.path or '/', default_version)
        else:
            path = parsed.path
        self.endpoint = parse.ParseResult(parsed.scheme, parsed.netloc, path,
                                          None, None, None)

    def geturl(self):
        url = self.endpoint.geturl()
        return url.endswith('/') and url[:-1] or url


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
        self._catalog = []
        self.session = requests.Session()

    @property
    def micro_versions(self):
        return self._micro_versions

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

    def _update_endpoints(self):
        for service in self._catalog:
            for endpoint in service.get('endpoints', []):
                if endpoint.get('interface') != 'public' \
                   or self.region and endpoint.get('region') != self.region:
                    continue
                self.endpoints[service.get('name')] = endpoint.get('url')
                break

    def update_auth_token(self):
        LOG.debug('auth body: {}', self.auth_body)
        resp = self.session.post(
            parse.urljoin(self.auth_url, '/v3/auth/tokens'),
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
        self._update_endpoints()
        LOG.debug('update auth token success, expires_at {},  token is {}',
                  self.auth_token.get('expires_at'),
                  self.auth_token.get('token'))

    def get_token(self) -> str:
        if 'token' not in self.auth_token or \
           time.time() >= self.auth_token.get('expires_at'):
            self.update_auth_token()
        return self.auth_token.get('token')

    @lru_cache
    def get_endpoint(self, service, defualt_version=None) -> Endpoint:
        # sourcery skip: reintroduce-else, swap-if-else-branches,
        # use-named-expression
        endpoint = self.endpoints.get(service)
        if not endpoint:
            raise exceptions.EndpointNotFound(service=service,
                                              region=self.region)
        return Endpoint(self.endpoints.get(service),
                        default_version=defualt_version)

    def get_user(self):
        if 'user' not in self.auth_token:
            self.update_auth_token()
        return self.auth_token.get('user', {})

    def get_project(self):
        if 'project' not in self.auth_token:
            self.update_auth_token()
        return self.auth_token.get('project', {})

    def get_project_id(self):
        if 'project' not in self.auth_token:
            self.update_auth_token()
        return self.get_project().get('id')

    def auth_request(self, headers: dict):
        headers['X-Auth-Token'] = self.get_token()

    @lru_cache
    def make_request_url(self, service, url: str, version=None):
        endpoint = self.get_endpoint(service, defualt_version=version)
        result = parse.urljoin(endpoint.geturl() + '/',
                               url[1:] if url.startswith('/') else url)
        return result
