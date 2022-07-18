from cmath import log
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
    cfg.IntOption('port', default=80),
    cfg.IntOption('workers', default=None),
    cfg.BooleanOption('use_cdn', default=False),
    cfg.Option('data_path', default='/etc/vstackboard'),
]

openstack_options = [
    cfg.Option('domain_name', default='Default'),
    cfg.IntOption('expires_time', default=60 * 60),
    cfg.MapOption('api_version', default={}),
    cfg.Option('cinder_api_version', default='v2'),
]


def load_configs():
    for file in ['/etc/vstackboard/vstackboard.conf',
                 os.path.join('etc', 'vstackboard.conf')]:
        if not os.path.exists(file):
            continue
        CONF.load(file)
        break
    else:
        raise RuntimeError('config file not found')


CONF.register_opts(default_options)
CONF.register_opts(openstack_options, group='openstack')
