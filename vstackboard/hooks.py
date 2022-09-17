from distutils.command import install
import shutil
import os
import site
import subprocess

from easy2use import fs
from easy2use import system


def _copy_vsm(static_path):
    # Copy vuetify-snackbar-message.js
    include_vsm = os.path.join('include', 'vuetify-snackbar-message.js')
    build_static_include = os.path.join(static_path, 'include')
    build_static_include_vsm = os.path.join(build_static_include,
                                            os.path.basename(include_vsm))
    if not os.path.exists(build_static_include):
        os.makedirs(build_static_include)
    if os.path.exists(build_static_include_vsm):
        fs.remove(build_static_include_vsm)
    shutil.copyfile(include_vsm, build_static_include_vsm)


def _copy_and_unzip_cdn(static_path):
    # Copy and unzip cdn.zip
    include_cdn_zip = os.path.join('include', 'cdn.zip')
    build_static_cdn_zip = os.path.join(static_path,
                                        os.path.basename(include_cdn_zip))
    build_static_cdn = os.path.join(static_path, 'cdn')

    if os.path.exists(build_static_cdn_zip):
        os.remove(build_static_cdn_zip)
    shutil.copyfile(include_cdn_zip, build_static_cdn_zip)

    if os.path.exists(build_static_cdn):
        fs.remove(build_static_cdn, recursive=True)
    fs.unzip(build_static_cdn_zip)


def _make_i18n_in_windows():
    msgfmt_path = None
    for path in site.getsitepackages():
        msgfmt_path = os.path.join(path, 'Tools', 'i18n', 'msgfmt.py')
        if os.path.isfile(msgfmt_path):
            break
    else:
        raise RuntimeError('msgfmt is not found')

    for po_file in os.listdir('i18n'):
        if not po_file.endswith('.po'):
            continue

        po_path = os.path.join('i18n', po_file)
        msgfmt_cmd = ['python', msgfmt_path, po_path]

        print(f'INFO: start to parse po file {po_path}')
        status, output = subprocess.getstatusoutput(' '.join(msgfmt_cmd))
        if status != 0:
            raise RuntimeError(f'msgfmt faild, {output}')

        language, _ = os.path.splitext(po_file)
        mo_file = f'{language}.mo'
        mo_path = os.path.join('i18n', mo_file)
        if not os.path.isfile(mo_path):
            raise RuntimeError(f'mo file {mo_file} not found')

        locale_path = os.path.join('i18n', 'locale', language, 'LC_MESSAGES',
                                   'vstackboard.mo')
        if not os.path.isdir(os.path.dirname(locale_path)):
            os.makedirs(os.path.dirname(locale_path))
        shutil.move(mo_path, locale_path)

    if os.path.exists(os.path.join('vstackboard', 'locale')):
        shutil.rmtree(os.path.join('vstackboard', 'locale'))
    shutil.move(os.path.join('i18n', 'locale'), 'vstackboard')


def _make_i18n():
    if system.OS.is_windows():
        _make_i18n_in_windows()


def setup_hook(config):
    # Tell distutils not to put the data_files in platform-specific
    # installation locations.
    # Refer to the instructions in the openstack/horizon project
    for scheme in install.INSTALL_SCHEMES.values():
        scheme['data'] = scheme['purelib']

    static_path = os.path.join('vstackboard', 'static')
    _copy_and_unzip_cdn(static_path)
    _copy_vsm(static_path)
    _make_i18n()
