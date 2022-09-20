from pbr import version
import queue
import logging

from vstackboard.common import constants

LOG = logging.getLogger(__name__)


def get_version():
    info = version.VersionInfo(constants.NAME)
    return info.release_string()


class ImageChunk(object):

    def __init__(self, size):
        self.size = int(size)
        self.chunks = queue.Queue()

        self.cached = 0
        self.readed = 0

    def add(self, chunk, size):
        self.cached += int(size)
        LOG.info('chunk cached: %.2f %%', self.cached_percent())
        self.chunks.put((chunk, int(size)))

    def cached_percent(self):
        return self.cached * 100 / self.size

    def readed_percent(self):
        return self.readed * 100 / self.size

    def read(self, *args, **kwargs):
        if self.chunks.empty() and self.all_cached():
            return None
        chunk = self.chunks.get()
        self.readed += chunk[1]

        LOG.info('chunk readed: %.2f %% empty: %s completed: %s',
                 self.readed_percent(), self.chunks.empty(), self.all_cached())

        return chunk[0]

    def all_cached(self):
        return self.cached >= self.size

    def __len__(self):
        return self.size
