from functools import lru_cache
from skylight.common import log
import re
import time
import json
from urllib import parse
import requests

from skylight.common import conf
from skylight.common import context
from skylight.common import exceptions
from skylight.common.db import api
from skylight.openstack import v3_auth

LOG = log.getLogger()
CONF = conf.CONF

PROXY_MAP = {}
REG_API_VERSION = re.compile(r'.*/v[\d.]')


class OpenstackV3AuthProxy(object):

    def __init__(self, auth_url, auth_project, auth_user, auth_password,
                 domain_name=None, region=None):
        self.auth_token = {}
        self.endpoints = {}
        self._catalog = []
        self._micro_versions: dict = {}

        for api_version in CONF.openstack.micro_versions:
            service, version = api_version.split(':')
            self._micro_versions[service] = version
        self.auth_plugin = v3_auth.OpenstackKeystoneV3Auth(
            auth_url, auth_user, auth_project, auth_password,
            domain_name or 'Default', region=region)

    def get_token(self):
        if 'token' not in self.auth_token or \
           time.time() >= self.auth_token.get('expires_at'):
            self.update_auth_token(
                fetch_max_version=CONF.openstack.fetch_max_version)
        return self.auth_token.get('token')

    def get_project_id(self):
        if 'project' not in self.auth_token:
            self.auth_plugin.update_auth_token()
        return self.auth_token.get('project', {}).get('id')

    def get_project(self):
        if 'project' not in self.auth_token:
            self.auth_plugin.update_auth_token()
        return self.auth_token.get('project', {})

    def get_user(self):
        if 'user' not in self.auth_token:
            self.auth_plugin.update_auth_token()
        return self.auth_token.get('user', {})

    def is_connectable(self):
        try:
            requests.get(self.auth_url, timeout=5)
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
        self.auth_plugin.auth_request(headers)
        if self._micro_versions:
            headers['OpenStack-API-Version'] = ','.join([
                f'{k}:{v}' for k, v in self._micro_versions.items()
            ])
        return headers

    def proxy_keystone(self, method='GET', url=None, data=None, headers=None):
        endpoint = self.auth_plugin.get_endpoint(
            'keystone', defualt_version=CONF.openstack.keystone_api_version)
        proxy_url = f"{endpoint}{url or '/'}"
        return self._proxy_openstack(method, proxy_url, data=data,
                                     headers=headers)

    def proxy_nova(self, method='GET', url=None, data=None, headers=None):
        endpoint = self.auth_plugin.get_endpoint(
            'nova', defualt_version=CONF.openstack.nova_api_version)
        proxy_url = f"{endpoint}{url or '/'}"
        if 'compute' in self._micro_versions:
            headers = headers or {}
            headers['X-OpenStack-Nova-API-Version'] = \
                self._micro_versions.get("compute")
        return self._proxy_openstack(method, proxy_url, data=data,
                                     headers=headers)

    def proxy_glance_upload(self, url, image_chunk):
        headers = self.get_header()
        headers.update({'Content-Type': 'application/octet-stream'})

        LOG.info('uploading image {}', url)
        resp = requests.put(f"{self.auth_plugin.get_endpoint('glance')}{url or '/'}",
                            headers=headers, data=image_chunk)
        LOG.info('uploaded image {}', url)
        return resp

    def proxy_glance(self, method='GET', url=None, data=None, headers=None):
        endpoint = self.auth_plugin.get_endpoint(
            'glance', defualt_version=CONF.openstack.glance_api_version)
        proxy_url = f"{endpoint }{url or '/'}"
        return self._proxy_openstack(method, proxy_url, data=data,
                                     headers=headers)

    def proxy_neutron(self, method='GET', url=None, data=None, headers=None):
        endpoint = self.auth_plugin.get_endpoint(
            'neutron', defual_version=CONF.openstack.neutron_api_version)
        proxy_url = f"{endpoint}{url or '/'}"
        return self._proxy_openstack(method, proxy_url, data=data,
                                     headers=headers)

    def proxy_cinder(self, method='GET', url=None, data=None, headers=None):
        proxy_url = f"{self.auth_plugin.get_endpoint('cinderv2')}{url or '/'}"
        return self._proxy_openstack(method, proxy_url, data=data,
                                     headers=headers)

    def _proxy_openstack(self, method, proxy_url, data=None, headers=None):
        proxy_headers = self.get_header()
        if headers:
            proxy_headers.update(headers)
        self.auth_token
        return requests.request(method, proxy_url, data=data,
                                headers=proxy_headers)

    def get_catalog_regions(self):
        regions = []
        for service in self._catalog:
            for endpoint in service.get('endpoints', []):
                if endpoint.get('interface') != 'public':
                    continue
                if endpoint.get('region') not in regions:
                    regions.append(endpoint.get('region'))
                break
        return regions


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
        cluster_proxy.auth_plugin.update_auth_token(
            fetch_max_version=CONF.openstack.fetch_max_version
        )
        PROXY_MAP.setdefault(ctxt.cluster_id, {})
        PROXY_MAP[ctxt.cluster_id][ctxt.region] = cluster_proxy

    return PROXY_MAP[ctxt.cluster_id][ctxt.region]
