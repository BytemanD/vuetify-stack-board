import requests

from skylight.common import conf
from skylight.common import utils
from skylight.common import context
from skylight.common.db import api
from skylight.common import log
from skylight.openstack import v3_auth

LOG = log.getLogger()
CONF = conf.CONF

PROXY_MAP = {}


class OpenstackProxy(object):

    def __init__(self, auth_url, auth_project, auth_user, auth_password,
                 domain_name=None, region=None):
        self.endpoints = {}
        self._catalog = []
        self._micro_versions: dict = {}
        self.session = requests.Session()

        for api_version in CONF.openstack.micro_versions:
            service, version = api_version.split(':')
            self._micro_versions[service] = version
        self.auth_plugin = v3_auth.OpenstackKeystoneV3Auth(
            auth_url, auth_user, auth_project, auth_password,
            domain_name or 'Default', region=region)

    def is_connectable(self):
        try:
            self.session.get(self.auth_plugin.auth_url, timeout=5)
            return True
        except requests.exceptions.ConnectionError:
            return False

    def _update_endpoints(self, token):
        for service in token.get('catalog', []):
            for endpoint in service.get('endpoints', []):
                if endpoint.get('interface') != 'public' \
                   or self.region and endpoint.get('region') != self.region:
                    continue
                self.endpoints[service.get('name')] = endpoint.get('url')
                break

    def _request_uri(self, request):
        return f'{self.proxy_to}{request.uri.split(self.url_replace, 1)[1]}'

    def _request_body(self, request):
        return None if request.method.upper() in ['DELETE', 'GET'] else \
            request.body

    def get_header(self) -> dict:
        headers = {'Content-Type': 'application/json'}

        if self.auth_plugin.micro_versions:
            headers['OpenStack-API-Version'] = ','.join([
                f'{k}:{v}' for k, v in self.auth_plugin.micro_versions.items()
            ])
        return headers

    def proxy_keystone(self, method='GET', url=None, data=None, headers=None):
        proxy_url = self.auth_plugin.make_request_url(
            'keystone', url, version=CONF.openstack.keystone_api_version)
        return self._proxy_openstack(method, proxy_url, data=data,
                                     headers=headers)

    @property
    def micro_versions(self):
        return self.auth_plugin.micro_versions

    def get_compute_max_version(self):
        resp = self._proxy_openstack('GEt',
                                     self.auth_plugin.get_endpoint('nova'))
        resp.raise_for_status()
        return resp.json().get('version', {}).get('version')

    @utils.log_proxy
    def proxy_nova(self, method='GET', url=None, data=None, headers=None):
        proxy_url = self.auth_plugin.make_request_url(
            'nova', url, version=CONF.openstack.nova_api_version)
        headers = {}
        micro_version = self.get_micro_version('nova')
        if micro_version:
            headers['X-OpenStack-Nova-API-Version'] = micro_version
        return self._proxy_openstack(method, proxy_url, data=data,
                                     headers=headers)

    def proxy_glance_upload(self, url, image_chunk):
        headers = self.get_header()
        headers.update({'Content-Type': 'application/octet-stream'})

        LOG.info('uploading image {}', url)
        proxy_url = self.auth_plugin.make_request_url(
            'glance', url, version=CONF.openstack.glance_api_version)

        resp = self.session.put(proxy_url, headers=headers, data=image_chunk)
        LOG.info('uploaded image {}', url)
        return resp

    def proxy_glance(self, method='GET', url=None, data=None, headers=None):
        proxy_url = self.auth_plugin.make_request_url(
            'glance', url, version=CONF.openstack.glance_api_version)
        return self._proxy_openstack(method, proxy_url, data=data,
                                     headers=headers)

    def proxy_neutron(self, method='GET', url=None, data=None, headers=None):
        proxy_url = self.auth_plugin.make_request_url(
            'neutron', url, version=CONF.openstack.neutron_api_version)
        return self._proxy_openstack(method, proxy_url, data=data,
                                     headers=headers)

    def proxy_cinder(self, method='GET', url=None, data=None, headers=None):
        proxy_url = self.auth_plugin.make_request_url('cinderv2', url)
        return self._proxy_openstack(method, proxy_url, data=data,
                                     headers=headers)

    def _proxy_openstack(self, method, proxy_url, data=None, headers=None):
        proxy_headers = self.get_header()
        if headers:
            proxy_headers.update(headers)

        self.auth_plugin.auth_request(proxy_headers)
        resp = self.session.request(method, proxy_url, timeout=60, data=data,
                                    headers=proxy_headers)
        resp.raise_for_status()
        return resp

    def get_catalog_regions(self):
        regions = []
        for service in self.auth_plugin._catalog:
            for endpoint in service.get('endpoints', []):
                if endpoint.get('interface') != 'public':
                    continue
                if endpoint.get('region') not in regions:
                    regions.append(endpoint.get('region'))
                break
        return regions

    def get_micro_version(self, service: str):
        if CONF.openstack.fetch_max_version:
            if service == 'nova' and 'nova' not in self.micro_versions:
                resp = self._proxy_openstack(
                    'GET', self.auth_plugin.get_endpoint('nova').geturl())
                self._micro_versions['compute'] = resp.json().get(
                    'version', {}).get('version')
        return self._micro_versions['compute']


def get_proxy(ctxt: context.RequestContext) -> OpenstackProxy:
    global PROXY_MAP
    if ctxt.cluster_id not in PROXY_MAP or \
       not PROXY_MAP[ctxt.cluster_id].get(ctxt.region):

        cluster = api.get_cluster_by_id(ctxt.cluster_id)
        cluster_proxy = OpenstackProxy(cluster.auth_url, cluster.auth_project,
                                       cluster.auth_user,
                                       cluster.auth_password,
                                       region=ctxt.region)
        cluster_proxy.auth_plugin.update_auth_token()
        PROXY_MAP.setdefault(ctxt.cluster_id, {})
        PROXY_MAP[ctxt.cluster_id][ctxt.region] = cluster_proxy

    return PROXY_MAP[ctxt.cluster_id][ctxt.region]
