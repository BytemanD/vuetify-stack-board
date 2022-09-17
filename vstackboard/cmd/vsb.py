import logging
import mimetypes
import os
import sys
import subprocess

import bs4
import requests
from urllib import parse
from jinja2 import PackageLoader, Environment

from easy2use.downloader.urllib import driver
from easy2use.globals import cli
from easy2use.globals import log
from easy2use import system

LOG = logging.getLogger(__name__)

HOME = os.path.abspath(os.path.dirname(os.path.pardir))


def download_statics_for_cdn():
    from vstackboard.common import constants                      # noqa

    LOG.info('Check cdn static files')
    LOG.info('========================')
    env = Environment(loader=PackageLoader('vstackboard', 'templates'))
    template = env.get_template('requires.html')
    html = template.render(cdn=constants.CDN)
    links = []
    bs_html = bs4.BeautifulSoup(html, features="html.parser")
    for script in bs_html.find_all(name='script'):
        src = script.get('src')
        if not src or not src.startswith('http') or not src.endswith('.js'):
            continue
        links.extend((src, '{}.map'.format(src)))

    for script in bs_html.find_all(name='link'):
        src = script.get('href')
        if not src or not src.startswith('http'):
            continue
        if src.endswith('.css'):
            links.extend((src, '{}.map'.format(src)))
    for link in links:
        save_static_content(link)
    LOG.info('========================')


def save_static_content(link):
    url = parse.urlparse(link)
    local_path = os.path.join(HOME, 'static', 'cdn', url.path[1:])
    if os.path.exists(local_path):
        LOG.info('file exists: %s', local_path)
        return

    save_path = os.path.dirname(local_path)
    if not os.path.exists(save_path):
        os.makedirs(save_path)
    LOG.info('Download cdn src %s to %s', link, os.path.abspath(local_path))
    resp = requests.get(link)
    try:
        resp.raise_for_status()
    except requests.exceptions.HTTPError:
        if resp.status_code == 404 and link.endswith('.map'):
            LOG.warning('%s not found, mybe it is no need.', link)
            return

    with open(local_path, 'w') as f:
        data = resp.text if isinstance(resp.content, bytes) else resp.content
        f.write(data)


class StaticDownload(cli.SubCli):
    NAME = 'static-download'

    def __call__(self, args):
        download_statics_for_cdn()


class Version(cli.SubCli):
    NAME = 'version'

    def __call__(self, args):
        from vstackboard.common import utils
        print(utils.get_version())


class Upgrade(cli.SubCli):
    NAME = 'upgrade'
    ARGUMENTS = [
        cli.Arg('-d', '--debug', action='store_true',
                help='Show debug message'),
        cli.Arg('-y', '--yes', action='store_true',
                help='answer yes for all questions'),
        cli.Arg('-c', '--cache', action='store_true',
                help='use cache if it is downloaded'),
    ]

    def __call__(self, args):
        from vstackboard.common import constants                 # noqa
        from vstackboard.common import utils                     # noqa
        try:
            releases = requests.get(constants.RELEASES_API).json()
        except Exception as e:
            print('Check releases failed, %s', e)
            return

        if not releases:
            print('No release found.')
            return
        current_version = utils.get_version()
        LOG.debug('Current version is: %s', current_version)
        latest = releases[0]
        LOG.debug('Latest release version: %s', latest.get('tag_name'))

        v1 = utils.PackageVersion(current_version)
        v2 = utils.PackageVersion(latest.get('tag_name'))

        if v1 >= v2:
            print('The current version is the latest.')
            return
        asset = latest.get('assets')[0] if latest.get('assets') else None
        if not asset:
            LOG.error('assets not found')
            return
        download_url = asset.get("browser_download_url")
        msg = f'\nA new {constants.NAME} release is available: ' \
              f'{latest["tag_name"]}\n' \
              f'Upgrade from:\n    {download_url}\n'
        print(msg)

        if not args.yes:
            while True:
                input_str = input(r'Upgrade now ? [y/n] ')
                if input_str == 'y':
                    break
                elif input_str == 'n':
                    return
                else:
                    print('Error, invalid input, must be y or n.')

        file_path = self.download(download_url, cache=args.cache)
        self.pip_install(file_path)

    def pip_install(self, file_path, force=False):
        install_cmd = ['pip3', 'install', file_path]
        if force:
            install_cmd.append('--force-reinstall')
        LOG.info('start to install %s', ' '.join(install_cmd))
        status, output = subprocess.getstatusoutput(' '.join(install_cmd))
        if status == 0:
            LOG.info('Install success, please restart vstackboard service')
        else:
            LOG.info('install failed, Output: %s', output)

    def download(self, url, cache=False):
        file_path = os.path.basename(url)
        if cache and os.path.exists(file_path):
            LOG.warning('use cache: %s', file_path)
            return file_path

        downloader = driver.Urllib3Driver(progress=True)
        LOG.info('download from %s', url)
        downloader.download(url)
        LOG.info('download success')
        return file_path


class Serve(cli.SubCli):
    NAME = 'serve'
    ARGUMENTS = log.get_args() + [
        cli.Arg('-p', '--port', type=int,
                help="Run serve with specified port"),
        cli.Arg('--develop', action='store_true',
                help="Run serve with develop mode"),
    ]

    def __call__(self, args):
        from vstackboard.common import conf                          # noqa
        from vstackboard import server                               # noqa

        if system.OS.is_windows():
            # NOTE(fjboy) For windows host, MIME type of .js file is
            # 'text/plain', so add this type before start http server.
            mimetypes.add_type('application/javascript', '.js')

        conf.load_configs()

        # from gevent import monkey
        # monkey.patch_all()
        server.start(develop=args.develop, port=args.port)


def main():
    cli_parser = cli.SubCliParser('VStackBoard Command Client')
    cli_parser.register_clis(Version, Upgrade, Serve, StaticDownload)
    cli_parser.call()


if __name__ == '__main__':
    sys.path.insert(0, HOME)
    sys.exit(main())
