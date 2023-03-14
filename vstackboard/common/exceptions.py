from tornado import web

from easy2use.common import exceptions as exs


class ApiException(web.HTTPError):

    def __init__(self, status, msg, reason=None):
        super().__init__(status, msg, reason=reason)


class ClusterNotFound(exs.BaseException):
    _msg = 'Endpoints for service:{service} region:{region} is not found'


class EndpointNotFound(exs.BaseException):
    _msg = 'Endpoints for service:{service} region:{region} is not found'


class PipInstallFailed(exs.BaseException):
    _msg = 'Install {package} failed, cmd={}'
