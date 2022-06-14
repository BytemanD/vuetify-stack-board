import logging

from tornado import web

from vstackboard.common import conf
from vstackboard.openstack import proxy

LOG = logging.getLogger(__name__)
CONF = conf.CONF

PROXY = None


def init():
    global PROXY

    PROXY = proxy.OpenstackV3AuthProxy()


class Index(web.RequestHandler):

    def get(self):
        self.redirect('/dashboard')


class Dashboard(web.RequestHandler):

    def get(self):
        self.render('dashboard.html', name='VStackBoard')


class OpenstackProxy(web.RequestHandler):

    def prepare(self):
        resp = PROXY.proxy_reqeust(self.request)
        self.set_status(resp.status_code, resp.reason)
        if resp.status_code in [204]:
            self.finish()
        else:
            self.finish(resp.content)
