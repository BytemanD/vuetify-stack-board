import dataclasses

from vstackboard.common import conf
from vstackboard.db import api

CONF = conf.CONF


@dataclasses.dataclass
class RequestContext:
    cluster_id: int
    region: str = dataclasses.field(default=CONF.openstack.default_region)

    @property
    def cluster(self):
        if not self._cluster:
            self._cluster = api.get_cluster_by_id(self.cluster_id)
        return self._cluster

    def __str__(self):
        return f'<cluster:{self.cluster_id} region:{self.region}>'
