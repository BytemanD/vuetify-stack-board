from datetime import datetime

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, DateTime


Base = declarative_base()


class BaseModel(object):
    _safe_fields = []

    def to_dict(self, safe=True):
        if safe and self._safe_fields:
            return {c: getattr(self, c) for c in self._safe_fields}
        else:
            return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class User(Base, BaseModel):
    __tablename__ = 'user'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(20))
    password = Column(String(20))


class Token(Base, BaseModel):
    __tablename__ = 'token'

    id = Column(Integer, primary_key=True, autoincrement=True)
    token = Column(String(20), unique=True, nullable=False)
    issue_at = Column(DateTime(), default=datetime.now, nullable=False)


class Cluster(Base, BaseModel):
    __tablename__ = 'cluster'
    _safe_fields = ['id', 'name', 'auth_url']

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(20))
    auth_url = Column(String(20))
    auth_project = Column(String(32))
    auth_user = Column(String(32))
    auth_password = Column(String(32))


class ImageChunk(Base, BaseModel):
    __tablename__ = 'image_chunk'

    id = Column(Integer, primary_key=True, autoincrement=True)
    image_id = Column(String(36))
    size = Column(Integer)
    cached = Column(Integer, default=0)
    readed = Column(Integer, default=0)
