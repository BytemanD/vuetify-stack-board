import json
import logging
import mimetypes
import os
import pathlib
import sys
import shutil
import subprocess

from easy2use.downloader.urllib import driver
from easy2use.globals import cli
from easy2use.globals import log
from easy2use.system import OS
from easy2use import system
from easy2use.web import application

from skylight.common import conf
from skylight.common import constants
from skylight.common import exceptions
from skylight.common import utils
from skylight.common.i18n import _
from skylight import views
from skylight.db import api as db_api
from skylight.common import dbconf


LOG = logging.getLogger(__name__)
CONF = conf.CONF

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Version(cli.SubCli):
    NAME = 'version'

    def __call__(self, args):
        print(utils.get_version())


class Upgrade(cli.SubCli):
    NAME = 'upgrade'
    ARGUMENTS = [
        cli.Arg('-d', '--debug', action='store_true',
                help=_('Show debug message')),
        cli.Arg('-y', '--yes', action='store_true',
                help=_('answer yes for all questions')),
        cli.Arg('-c', '--cache', action='store_true',
                help=_('use cache if it is downloaded')),
        cli.Arg('--image', action='store_true',
                help=_('Check image version')),
    ]

    def __call__(self, args):
        if args.image:
            last_version = self.upgrade_from_image()
            return
        last_version = utils.check_last_version()
        if not last_version:
            print(_('The current version is the latest.'))
            return

        version = last_version.get('version')
        download_url = last_version.get('download_url')
        msg = f'\nA new {constants.NAME} release is available: ' \
              f'{version}\n' \
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
        try:
            self.pip_install(file_path)
        except Exception as e:
            LOG.error('Install failed, error: %s', e)
            return
        print(_('Install success.'))
        print(_('Please execute the command below to restart skylight:'))
        print('    systemctl restart skylight')

    def upgrade_from_image(self):
        latest_version = utils.check_last_image_version()
        if not latest_version:
            print(_('The current version is the latest.'))
            return

        msg = f'{_("A new image is available:")} ' \
              f'{latest_version.get("version")}'
        print('\n' + msg + '\n')

    def pip_install(self, file_path, force=False):
        install_cmd = ['pip3', 'install', file_path]
        if force:
            install_cmd.append('--force-reinstall')
        LOG.info(_('start to install %s'), ' '.join(install_cmd))
        status, output = subprocess.getstatusoutput(' '.join(install_cmd))
        if status != 0:
            LOG.error(_('Install Output: %s'), output)
            raise exceptions.PipInstallFailed(package=file_path,
                                              cmd=' '.join(install_cmd))

    def download(self, url, cache=False):
        file_path = os.path.basename(url)
        tmp_dir = OS.is_windows() and os.getenv('TMP') or '/tmp'
        cached_file = os.path.join(tmp_dir, '/tmp')
        if cache and os.path.exists(cached_file):
            LOG.warning('use cache: %s', cached_file)
            return cached_file

        downloader = driver.Urllib3Driver(progress=True,
                                          cached_file=tmp_dir)
        LOG.info(_('download from %s'), url)
        downloader.download(url)
        LOG.info(_('download success'))
        return file_path


class VstackboardApp(application.TornadoApp):

    def start(self, **kwargs):
        db_api.init()
        views.CONF_DB_API = dbconf.DBApi(conf.configs_items_in_db)
        super().start(**kwargs)


def init_favicon_ico(favicon_file: pathlib.Path, static_path):
    LOG.debug('将favicon.ico 文件链接到 static 下')
    if not favicon_file.exists():
        LOG.warning('favicon file %s not exists', favicon_file)
        return
    static_favicon_ico = pathlib.Path(static_path, 'favicon.ico')
    if static_favicon_ico.exists():
        LOG.debug('删除static下的 favicon.ico 文件')
        os.remove(static_favicon_ico)
    os.link(favicon_file, os.path.join(static_path, 'favicon.ico'))


def init_config_json(json_file: pathlib.Path, update_config_json=False):
    json_file_origin = pathlib.Path(json_file.parent,
                                    json_file.name + '.origin')
    if not update_config_json:
        if not json_file_origin.exists():
            return
        if json_file.exists():
            os.remove(json_file)
        shutil.move(json_file_origin, json_file)
    else:
        if not json_file.exists():
            LOG.warning("config json %s is not exists", json_file)
            return
        if not json_file_origin.exists():
            shutil.copyfile(json_file, json_file_origin)

        LOG.info("更新 config.json 文件: %s", json_file)
        if not json_file.exists():
            return
        if not CONF.web.stylesheet:
            return

        with open(json_file) as fp:
            config_json = json.load(fp)
        config_json['static_stylesheet'] = CONF.web.stylesheet
        config_json['backend_url'] = ''

        new_config_json = json.dumps(config_json, indent=4)
        LOG.debug("new config json: %s", new_config_json)
        with open(json_file, 'w') as fp:
            fp.write(new_config_json)


class Serve(cli.SubCli):
    NAME = 'serve'
    ARGUMENTS = log.get_args() + [
        cli.Arg('-p', '--port', type=int, default=8081,
                help=_("Run serve with specified port. Default: 8081")),
        cli.Arg('--develop', action='store_true',
                help=_("Run serve with develop mode")),
        cli.Arg('--static', default='skylight-web/dist/static',
                help=_("The path of static files")),
        cli.Arg('--template', default='skylight-web/dist',
                help=_("The path of template")),
        cli.Arg('--update-config-json', action='store_true',
                help=_("Update file: config.json")),
        cli.Arg('-c', '--enale-cross-domain', action='store_true',
                help=_("Enable cross domain")),
    ]

    def __call__(self, args):
        if system.OS.is_windows():
            # NOTE(fjboy) For windows host, MIME type of .js file is
            # 'text/plain', so add this type before start http server.
            mimetypes.add_type('application/javascript', '.js')

        conf.load_configs()
        if args.enale_cross_domain:
            CONF.enable_cross_domain = True
        if args.port:
            CONF.port = args.port

        if args.static and not pathlib.Path(args.static).exists():
            LOG.warning('static path %s not exists.', args.static)
        if args.template and not pathlib.Path(args.template).exists():
            LOG.warning('template path %s not exists.', args.template)

        # NOTE: init config.json
        init_config_json(pathlib.Path(args.template, 'config.json'),
                         update_config_json=args.update_config_json)
        # NOTE: favicon.ico file must put in static path
        init_favicon_ico(pathlib.Path(args.template, 'favicon.ico'),
                         args.static)

        application.init(enable_cross_domain=True)
        routes = application.get_routes() + views.get_routes()
        app = VstackboardApp(routes, develop=args.develop,
                             static_path=args.static,
                             template_path=args.template,)
        LOG.debug("starting server on port: %s", CONF.port)
        app.start(port=CONF.port,
                  num_processes=CONF.workers)


def main():
    cli_parser = cli.SubCliParser(_('VStackBoard Command Line'),
                                  title=_('Subcommands'))
    cli_parser.register_clis(Version, Upgrade, Serve)
    cli_parser.call()


if __name__ == '__main__':
    sys.exit(main())
