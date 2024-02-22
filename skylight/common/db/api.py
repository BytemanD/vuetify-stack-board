from datetime import datetime
import os
from skylight.common import log

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import scoped_session

from skylight.common.db import models
from skylight.common import conf
from skylight.common import constants
from skylight.common import dbconf

CONF = conf.CONF
LOG = log.getLogger()
ENGINE = None
SESSION = None


def init(admin_password=None):
    global DB_FILE, ENGINE, SESSION

    LOG.info('data path: {}', CONF.data_path)
    DB_FILE = os.path.join(CONF.data_path, 'skylight.db')
    ENGINE = create_engine(f'sqlite:///{DB_FILE}')
    SESSION = scoped_session(sessionmaker(bind=ENGINE))

    LOG.info('database file is {}', DB_FILE)
    if not os.path.exists(CONF.data_path):
        os.makedirs(CONF.data_path)
    models.Base.metadata.create_all(ENGINE, checkfirst=True)

    dbconf.init(DB_FILE, engine=ENGINE, session=SESSION)

    admin_password = admin_password or constants.ADMIN_PASSWORD
    user = get_user('admin')
    if user:
        if user.password != admin_password:
            update_user_password(user, admin_password)
    else:
        create_user('admin', admin_password)


def get_user(name):
    return SESSION.query(models.User).filter_by(name=name).first()


def create_user(name, password):
    SESSION.add(models.User(name=name, password=password))
    SESSION.commit()


def update_user_password(user, password):
    SESSION.query(models.User).filter_by(id=user.id).update(
        {'password': password})
    SESSION.commit()


def get_token(token):
    return SESSION.query(models.Token).filter_by(token=token).first()


def create_token(token):
    SESSION.add(models.Token(token=token, issue_at=datetime.now()))
    SESSION.commit()


def update_token_issue_at(token):
    SESSION.query(models.Token).filter_by(token=token).update(
        {'issue_at': datetime.now()})
    SESSION.commit()


def delete_token(token):
    SESSION.query(models.Token).filter_by(token=token).delete()
    SESSION.commit()


def create_cluster(name, auth_url, auth_project, auth_user, auth_password):
    SESSION.add(
        models.Cluster(name=name, auth_url=auth_url,
                       auth_project=auth_project, auth_user=auth_user,
                       auth_password=auth_password)
    )
    SESSION.commit()


def query_cluster():
    return SESSION.query(models.Cluster).all()


def get_cluster_by_id(cluster_id: int):
    return SESSION.query(models.Cluster).filter_by(id=cluster_id).first()


def get_cluster_by_name(name):
    return SESSION.query(models.Cluster).filter_by(name=name).first()


def delete_cluster_by_id(cluster_id):
    deleted = SESSION.query(models.Cluster).filter_by(id=cluster_id).delete()
    SESSION.commit()
    return deleted


# image chunk
def create_image_chunk(image_id, size):
    SESSION.add(
        models.ImageChunk(image_id=image_id, size=size, cached=0, readed=0)
    )
    SESSION.commit()


def query_image_chunk():
    return SESSION.query(models.ImageChunk).all()


def get_image_chunk_by_id(image_chunk_id):
    return SESSION.query(models.ImageChunk).filter_by(
        id=image_chunk_id).first()


def get_image_chunk_by_image_id(image_id):
    return SESSION.query(
        models.ImageChunk).filter_by(image_id=image_id).first()


def add_image_chunk_cached(image_id, cached):
    image_chunk = get_image_chunk_by_image_id(image_id)
    image_chunk.cached += cached
    SESSION.commit()


def add_image_chunk_readed(image_id, readed):
    image_chunk = get_image_chunk_by_image_id(image_id)
    image_chunk.readed += readed
    SESSION.commit()


def delete_image_chunk(image_chunk_id):
    deleted = SESSION.query(
        models.ImageChunk).filter_by(id=image_chunk_id).delete()
    SESSION.commit()
    return deleted
