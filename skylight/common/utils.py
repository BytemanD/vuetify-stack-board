import os
import re
import subprocess
from pbr import version
import queue
import functools

import requests
from easy2use.common import pkg
from easy2use.system import OS
from easy2use.downloader.urllib import driver

from skylight.common import constants
from skylight.common import exceptions
from skylight.common import log
from skylight.common.i18n import _
from skylight.common.db import api

LOG = log.getLogger()


def get_version():
    info = version.VersionInfo(constants.NAME)
    return info.release_string()


def check_last_version():
    try:
        releases = requests.get(constants.RELEASES_API).json()
    except Exception as e:
        LOG.error('Check releases failed, {}', e)
        return

    if not releases:
        LOG.info('No release found.')
        return
    current_version = get_version()
    LOG.debug(_('Current version is: {}'), current_version)
    latest = releases[0]
    LOG.debug(_('Latest release version: {}'), latest.get('tag_name'))

    v1 = pkg.PackageVersion(current_version)
    v2 = pkg.PackageVersion(latest.get('tag_name'))
    if v1 >= v2:
        return
    asset = latest.get('assets')[0] if latest.get('assets') else None
    if not asset:
        LOG.error('assets not found')
        return
    download_url = asset.get("browser_download_url")
    return {'version': '.'.join(v2.version), 'download_url': download_url}


def check_last_image_version():
    try:
        tags = requests.get(constants.IMAGE_TAGS_API).json().get('results')
    except Exception as e:
        LOG.error('get tags failed, {}', e)
        return

    if not tags:
        LOG.info('no repository tags found.')
        return
    current_version = get_version()
    LOG.debug(_('Current version is: {}'), current_version)

    v1 = pkg.PackageVersion(current_version)

    latest_version = v1
    for tag in tags:
        if tag.get('name') == 'latest':
            continue
        v2 = pkg.PackageVersion(tag.get('name'))
        if v2 > latest_version:
            latest_version = v2

    if latest_version > v1:
        version_string = '.'.join(latest_version.version)
        return {
            'version': version_string,
            'pull_url': f'fjboy/{constants.NAME}:${version_string}'
        }


class ImageChunk(object):

    def __init__(self, url, size):
        matched = re.match(r'/(.*)/images/(.*)/file', url)
        self.size = int(size)
        self.chunks = queue.Queue()
        self.image_id = matched.group(2)
        api.create_image_chunk(self.image_id, self.size)

    def add(self, chunk, size):
        self.chunks.put((chunk, int(size)))
        LOG.info('chunk cached: + %.2f', self.size)

    def read(self, *args, **kwargs):
        if self.chunks.empty() and self.all_cached():
            return None
        chunk = self.chunks.get()
        LOG.info('read chunk, empty: {} all cached: {}',
                 self.chunks.empty(), self.all_cached())

        api.add_image_chunk_readed(self.image_id, chunk[1])
        return chunk[0]

    def all_cached(self):
        image_chunk = api.get_image_chunk_by_image_id(self.image_id)
        return image_chunk.cached >= self.size

    def __len__(self):
        return self.size


# TODO: move is to easy2use
def with_response(return_code=200):

    def _response(func):
        @functools.wraps(func)
        def wrapper(self, *args, **kwargs):
            try:
                resp = func(self, *args, **kwargs)
            except exceptions.ApiException:
                raise
            except Exception as e:
                LOG.exception(e)
                resp = 500, f'Internal Server error: {str(e)}'

            if resp is None:
                status, body = 204, None
            if isinstance(resp, tuple):
                status, body = resp
            else:
                status = return_code
                body = resp

            if status >= 400:
                LOG.error('request error, response body: {}', body)

            self.set_status(status)
            if body:
                self.finish(body)

        return wrapper

    return _response


def upgrade_from_image():
    latest_version = check_last_image_version()
    if not latest_version:
        print(_('The current version is the latest.'))
        return

    msg = f'{_("A new image is available:")} ' \
        f'{latest_version.get("version")}'
    print('\n' + msg + '\n')


def pip_install(file_path, force=False):
    install_cmd = ['pip3', 'install', file_path]
    if force:
        install_cmd.append('--force-reinstall')
    LOG.info(_('start to install {}'), ' '.join(install_cmd))
    status, output = subprocess.getstatusoutput(' '.join(install_cmd))
    if status != 0:
        LOG.error(_('Install Output: {}'), output)
        raise exceptions.PipInstallFailed(package=file_path,
                                          cmd=' '.join(install_cmd))


def download(url, cache=False):
    file_path = os.path.basename(url)
    tmp_dir = OS.is_windows() and os.getenv('TMP') or '/tmp'
    cached_file = os.path.join(tmp_dir, '/tmp')
    if cache and os.path.exists(cached_file):
        LOG.warning('use cache: {}', cached_file)
        return cached_file

    downloader = driver.Urllib3Driver(progress=True,
                                      cached_file=tmp_dir)
    LOG.info(_('download from {}'), url)
    downloader.download(url)
    LOG.info(_('download success'))
    return file_path
