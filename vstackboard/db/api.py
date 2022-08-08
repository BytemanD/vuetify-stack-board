import os
import logging

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from vstackboard.db import models
from vstackboard.common import conf, dbconf

CONF = conf.CONF
LOG = logging.getLogger(__name__)
ENGINE = None
SESSION = None


def init():
    global DB_FILE, ENGINE, SESSION

    DB_FILE = os.path.join(CONF.data_path, 'vstackboard.db')
    ENGINE = create_engine('sqlite:///{}'.format(DB_FILE))
    SESSION = sessionmaker(bind=ENGINE)()

    LOG.info('database file is %s', DB_FILE)
    models.Base.metadata.create_all(ENGINE, checkfirst=True)

    dbconf.init(conf.configs_itesm_in_db,
                DB_FILE, engine=ENGINE, session=SESSION)


def create_cluster(name, auth_url, auth_project, auth_user, auth_password):
    SESSION.add(
        models.Cluster(name=name, auth_url=auth_url,
                       auth_project=auth_project, auth_user=auth_user,
                       auth_password=auth_password)
    )
    SESSION.commit()


def query_cluster():
    return SESSION.query(models.Cluster).all()


def get_cluster_by_id(cluster_id):
    return SESSION.query(models.Cluster).filter_by(id=cluster_id).first()


def get_cluster_by_name(name):
    return SESSION.query(models.Cluster).filter_by(name=name).first()


def delete_cluster_by_id(cluster_id):
    deleted = SESSION.query(models.Cluster).filter_by(id=cluster_id).delete()
    SESSION.commit()
    return deleted
