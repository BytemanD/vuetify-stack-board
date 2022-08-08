import os
import logging

from tornado import ioloop
from tornado import httpserver
from tornado import web

from vstackboard import views
from vstackboard.db import api as db_api
from vstackboard.common import conf
from vstackboard.common import dbconf


LOG = logging.getLogger('tornado.application')


CONF = conf.CONF
ROOT = os.path.dirname(os.path.abspath(__file__))
ROUTES = [
    (r'/', views.Index),
    (r'/dashboard', views.Dashboard),
    (r'/welcome', views.Welcome),
    (r'/configs', views.Configs),
    (r'/cluster', views.Cluster),
    (r'/cluster/(.*)', views.Cluster),
    (r'/identity(.*)', views.KeystoneProxy),
    (r'/computing(.*)', views.NovaProxy),
    (r'/image(.*)', views.GlanceProxy),
    (r'/networking(.*)', views.NeutronProxy),
    (r'/volume(.*)', views.CinderProxy),
]


def start(develop=False, host=None, port=None):
    template_path = os.path.join(ROOT, 'templates')
    static_path = os.path.join(ROOT, 'static')
    app = web.Application(ROUTES, debug=develop, template_path=template_path,
                          static_path=static_path)

    LOG.info('Staring server ...')

    db_api.init()
    views.CONF_DB_API = dbconf.DBApi(conf.configs_itesm_in_db)

    if develop:
        app.listen(port or CONF.port)
    else:
        server = httpserver.HTTPServer(app)
        server.bind(port or CONF.port)
        server.start(num_processes=CONF.workers)
    ioloop.IOLoop.instance().start()
