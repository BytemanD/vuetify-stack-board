import os
import socket
import logging

from easy2use.globals import cfg
from easy2use.common.customconfig import Item, IntItem, BoolItem

LOG = logging.getLogger(__name__)

CONF = cfg.CONF
DEFAULT_HOST = socket.gethostname()

default_options = [
    cfg.BooleanOption('debug', default=False),
    cfg.Option('log_file', default=None),
    cfg.IntOption('port', default=80),
    cfg.IntOption('workers', default=None),
    cfg.BooleanOption('use_cdn', default=False),
    cfg.Option('data_path', default='/etc/vstackboard'),
    cfg.BooleanOption('enable_cross_domain', default=False),
]

openstack_options = [
    cfg.Option('domain_name', default='Default'),
    cfg.IntOption('expires_time', default=60 * 60),
    cfg.BooleanOption('fetch_max_version', default=True),
    cfg.MapOption('api_version', default={}),
    cfg.Option('cinder_api_version', default='v2'),
    cfg.Option('default_region', default='RegionOne'),
]

configs_itesm_in_db = [
    Item(name='domain_name', default='Default'),
    IntItem(name='expires_time', default=60 * 60),
    BoolItem(name='fetch_max_version', default=True),
    Item(name='cinder_api_version', default='v2'),
]


def load_configs():
    for file in ['/etc/vstackboard/vstackboard.conf',
                 os.path.join('etc', 'vstackboard.conf')]:
        if not os.path.exists(file):
            continue
        LOG.info('Load config file from %s', file)
        CONF.load(file)
        break
    else:
        LOG.warning('config file not found')


CONF.register_opts(default_options)
CONF.register_opts(openstack_options, group='openstack')
