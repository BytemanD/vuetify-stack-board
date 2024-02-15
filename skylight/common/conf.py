import os
import socket
import pathlib

from easy2use.globals import cfg
from easy2use.globals import cfg2

from skylight.common import log
from skylight.common import exceptions

LOG = log.getLogger()

CONF = cfg.CONF
DEFAULT_HOST = socket.gethostname()


class OpenstackOptions(cfg2.OptionGroup):
    domain_name = cfg2.Option('domain_name', default='Default')
    expires_time = cfg2.IntOption('expires_time', default=60 * 60)
    fetch_max_version = cfg2.BoolOption('fetch_max_version', default=True)
    cinder_api_version = cfg2.Option('cinder_api_version', default='v2')
    glance_api_version = cfg2.Option('glance_api_version', default='v2')
    nova_api_version = cfg2.Option('nova_api_version', default='v2.1')
    neutron_api_version = cfg2.Option('neutron_api_version', default='v2.0')
    default_region = cfg2.Option('default_region', default='RegionOne')
    keystone_api_version = cfg2.Option('keystone_api_version', default='v3')
    micro_versions = cfg2.ListOption('micro_versions', default=[])
    unauth_retry_times = cfg2.IntOption('unauth_retry_times', default=1)


class WebOptions(cfg2.OptionGroup):
    stylesheet = cfg2.ListOption(name='stylesheet', default=None)


class AppConf(cfg2.TomlConfig):
    debug = cfg2.BoolOption('debug', default=True)
    log_file = cfg2.Option('log_file', default=None)
    port = cfg2.IntOption('port', default=8081)
    workers = cfg2.IntOption('workers', default=None)
    data_path = cfg2.Option('data_path', default='/etc/skylight')
    enable_cross_domain = cfg2.BoolOption('enable_cross_domain', default=False)
    index_redirect = cfg2.Option('index_redirect', default='/welcome.html')
    token_expired = cfg2.IntOption('token_expired', default=3600)

    openstack = OpenstackOptions()
    web = WebOptions()


def load_configs(conf_file=None):
    conf_files = [conf_file] if conf_file else [
        pathlib.Path('etc', 'skylight.toml').absolute(),
        '/etc/skylight/skylight.toml',
    ]
    for file in conf_files:
        if not os.path.exists(file):
            continue
        CONF.load(file)
        break
    else:
        raise exceptions.ConfileNotExists(
            files=[str(f) for f in conf_files])


CONF: AppConf = AppConf()
