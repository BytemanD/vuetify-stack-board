from datetime import datetime
from datetime import timedelta
import logging
import uuid

from skylight.common import conf
from skylight.common.db import api as db_api

CONF = conf.CONF
LOG = logging.getLogger(__name__)


def new_token():
    token = uuid.uuid4().hex
    db_api.create_token(token)
    return token


def valid_token(token):
    t = db_api.get_token(token)
    if t is None:
        return False
    delta = datetime.now() - t.issue_at
    if delta.total_seconds() >= CONF.token_expired:
        LOG.warning('token %s is expired', token)
        return False

    if delta.total_seconds() >= CONF.token_expired / 2:
        db_api.update_token_issue_at(token)
    return True
