import json
import mimetypes
import os
import pathlib
import sys
import shutil

import click
from easy2use import system
from easy2use.web import application

from skylight.common import conf
from skylight.common import constants
from skylight.common import log
from skylight.common import utils
from skylight.common.i18n import _
from skylight import views
from skylight.common.db import api as db_api


LOG = log.getLogger()
CONF = conf.CONF

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def init_favicon_ico(favicon_file: pathlib.Path, static_path):
    LOG.debug('将favicon.ico 文件链接到 static 下')
    if not favicon_file.exists():
        LOG.warning('favicon file {} not exists', favicon_file)
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
            LOG.warning("config json {} is not exists", json_file)
            return
        if not json_file_origin.exists():
            shutil.copyfile(json_file, json_file_origin)

        LOG.info("更新 config.json 文件: {}", json_file)
        if not json_file.exists():
            return
        if not CONF.web.stylesheet:
            return

        with open(json_file) as fp:
            config_json = json.load(fp)
        config_json['static_stylesheet'] = CONF.web.stylesheet
        config_json['backend_url'] = ''

        new_config_json = json.dumps(config_json, indent=4)
        LOG.debug("new config json: {}", new_config_json)
        with open(json_file, 'w') as fp:
            fp.write(new_config_json)


class SkylightServer(application.TornadoApp):

    def start(self, **kwargs):
        super().start(**kwargs)


@click.group(context_settings={'help_option_names': ['-h', '--help']})
def main():
    pass


@main.command()
def version():
    print(utils.get_version())


@main.command()
@click.option('-d', '--debug', is_flag=True, help=_('Show debug message'))
@click.option('-y', '--yes', is_flag=True,
              help=_('answer yes for all questions'))
@click.option('-c', '--cache', is_flag=True,
              help=_('use cache if it is downloaded'))
@click.option('--image', is_flag=True, help=_('Check image version'))
def upgrade(image, cache, yes, debug):
    if image:
        last_version = utils.upgrade_from_image()
        return
    last_version = utils.check_last_version()
    if not last_version:
        print(_('The current version is the latest.'))
        return

    version = last_version.get('version')
    download_url = last_version.get('download_url')
    msg = f'\nA new {constants.NAME} release is available: {version}\n' \
          f'Upgrade from:\n    {download_url}\n'
    print(msg)

    if not yes:
        while True:
            input_str = input(r'Upgrade now ? [y/n] ')
            if input_str == 'y':
                break
            elif input_str == 'n':
                return
            else:
                print('Error, invalid input, must be y or n.')

    file_path = utils.download(download_url, cache=cache)
    try:
        utils.pip_install(file_path)
    except Exception as e:
        LOG.error('Install failed, error: {}', e)
        return
    print(_('Install success.'))
    print(_('Please execute the command below to restart skylight:'))
    print('    systemctl restart skylight')


@main.command()
@click.option('-v', '--verbose', is_flag=True, multiple=True,
              help=_("Show verbose log"))
@click.option('--static', default='skylight-web/dist/static',
              help=_("The path of static files"))
@click.option('--template', default='skylight-web/dist',
              help=_("The path of template"))
@click.option('--update-config-json', is_flag=True,
              help=_("Update file: config.json"))
@click.option('-c', '--enable-cross-domain', is_flag=True,
              help=_("Enable cross domain"))
@click.option('--admin-password', help=_("Init admin password"))
@click.option('--develop', is_flag=True,
              help=_("Run serve with develop mode"))
def serve(develop, admin_password, enable_cross_domain,
          update_config_json, template, static, verbose):
    if system.OS.is_windows():
        # NOTE(fjboy) For windows host, MIME type of .js file is
        # 'text/plain', so add this type before start http server.
        mimetypes.add_type('application/javascript', '.js')

    conf.load_configs()
    if enable_cross_domain:
        CONF.enable_cross_domain = True

    log.basic_config(verbose_count=len(verbose))
    if static and not pathlib.Path(static).exists():
        LOG.warning('static path {} not exists.', static)
    if template and not pathlib.Path(template).exists():
        LOG.warning('template path {} not exists.', template)

    # NOTE: init config.json
    init_config_json(pathlib.Path(template, 'config.json'),
                     update_config_json=update_config_json)
    # NOTE: favicon.ico file must put in static path
    init_favicon_ico(pathlib.Path(template, 'favicon.ico'),
                     static)

    application.init(enable_cross_domain=True)
    routes = application.get_routes() + views.get_routes()
    db_api.init(admin_password=admin_password)
    app = SkylightServer(routes, develop=develop,
                         static_path=static, template_path=template,)
    LOG.debug("starting server on port: {}", CONF.port)
    app.start(port=CONF.port, num_processes=CONF.workers)


if __name__ == '__main__':
    sys.exit(main())
