
import os
from requests import session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from vstackboard.db import models
from vstackboard.common import conf

CONF = conf.CONF

ENGINE = None
SESSION = None

ENGINE = create_engine('sqlite:///{}'.format(
    os.path.join(CONF.data_path, 'vstackboard.db')))

SESSION = sessionmaker(bind=ENGINE)()


def init():
    global ENGINE, SESSION

    models.Base.metadata.create_all(ENGINE, checkfirst=True)


def create_env(name, auth_url, auth_project, auth_user, auth_password):
    SESSION.add(
        models.Env(name=name, auth_url = auth_url,
                   auth_project=auth_project, auth_user=auth_user,
                   auth_password=auth_password,
        )
    )
    SESSION.commit()


def query_env():
    return SESSION.query(models.Env).all()


def get_env_by_name(name):
    return SESSION.query(models.Env).filter_by(name=name).first()
