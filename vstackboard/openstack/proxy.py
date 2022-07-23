import logging
import time
import json

import requests

from vstackboard.common import conf

LOG = logging.getLogger(__name__)
CONF = conf.CONF


class OpenstackV3AuthProxy(object):

    def __init__(self, auth_url, auth_project, auth_user, auth_password,
                 domain_name=None):
        self.auth_url = auth_url
        self.auth_project = auth_project
        self.auth_user = auth_user
        self.auth_password = auth_password
        self.domain_name = domain_name or 'Default'

        self.auth_body = self._get_auth_body()
        self.auth_token = {}
        self.endpoints = {}
        self._api_version = None

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
        return self.endpoints.get(service)

    def _update_endpoints(self, token):
        for service in token.get('catalog', []):
            for endpoint in service.get('endpoints', []):
                if endpoint.get('interface') != 'public':
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
                            "domain": { "name": self.domain_name },
                            "password": self.auth_password
                        }
                    }
                },
                "scope": {
                    "project": {
                        "domain": { "id": "default" },
                        "name": self.auth_project
                    }
                }
            }
        }

    def _get_proxy_url(self, uri):
        if uri.startswith('/identity/'):
            proxy_uri = '{}{}'.format(self._get_endpoint('keystone'),
                                      uri.split('/identity', 1)[1])
        elif uri.startswith('/computing/'):
            proxy_uri = '{}{}'.format(self._get_endpoint('nova'),
                                      uri.split('/computing', 1)[1])
        elif uri.startswith('/image/'):
            proxy_uri = '{}{}'.format(self._get_endpoint('glance'),
                                      uri.split('/image', 1)[1])
        elif uri.startswith('/networking/'):
            proxy_uri = '{}{}'.format(self._get_endpoint('neutron'),
                                      uri.split('/networking', 1)[1])
        elif uri.startswith('/volume/'):
            service = 'cinder{}'.format(CONF.openstack.cinder_api_version)
            proxy_uri = '{}{}'.format(self._get_endpoint(service),
                                      uri.split('/volume', 1)[1])
        else:
            raise RuntimeError('Invalid uri %s' % uri)

        return proxy_uri

    def _request_uri(self, request):
        return '{}{}'.format(
            self.proxy_to, request.uri.split(self.url_replace, 1)[1])

    def _request_body(self, request):
        return None if request.method.upper() in ['DELETE', 'GET'] else \
            request.body

    def _get_api_version(self):
        if not self._api_version:
            self._api_version = ','.join([
                '{} {}'.format(k, v) for k, v in \
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

    def proxy_reqeust(self,  request):
        """
        request: tornado Request
        """
        return requests.request(request.method,
                                self._get_proxy_url(request.uri),
                                data=self._request_body(request),
                                headers=self.get_header())
