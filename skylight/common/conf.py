import os
import socket
import logging

from easy2use.globals import cfg

LOG = logging.getLogger(__name__)

CONF = cfg.CONF
DEFAULT_HOST = socket.gethostname()

default_options = [
    cfg.BooleanOption('debug', default=False),
    cfg.Option('log_file', default=None),
    cfg.IntOption('port', default=8081),
    cfg.IntOption('workers', default=None),
    cfg.Option('data_path', default='/etc/skylight'),
    cfg.BooleanOption('enable_cross_domain', default=False),
    cfg.Option('index_redirect', default='/welcome.html'),
    cfg.IntOption('token_expired', default=3600),
]

openstack_options = [
    cfg.Option('domain_name', default='Default'),
    cfg.IntOption('expires_time', default=60 * 60),
    cfg.BooleanOption('fetch_max_version', default=True),
    cfg.MapOption('api_version', default={}),
    cfg.Option('cinder_api_version', default='v2'),
    cfg.Option('default_region', default='RegionOne'),
]

web_options = [
    cfg.ListOption(name='stylesheet', default=None),
]


def load_configs():
    for file in [os.path.join('etc', 'skylight.conf'),
                 '/etc/skylight/skylight.conf']:
        if not os.path.exists(file):
            continue
        LOG.info('Load config file from %s', file)
        CONF.load(file)
        break
    else:
        LOG.warning('config file not found')


CONF.register_opts(default_options)
CONF.register_opts(openstack_options, group='openstack')
CONF.register_opts(web_options, group='web')
