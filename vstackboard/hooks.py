from abc import abstractmethod
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


class MsgFmtDriver(object):

    def __init__(self) -> None:
        self.msgfmt = None

    @staticmethod
    def _run_cmd(cmd: list):
        print(f'INFO: Run cmd {cmd}')
        return subprocess.getstatusoutput(' '.join(cmd))

    @abstractmethod
    def get_msgfmt(self):
        pass

    @abstractmethod
    def parse_po_file(self, po_path) -> str:
        """Parse po file and return mo file path"""
        pass

    def _check_msgfmt_or_raise(self):
        self.msgfmt = self.get_msgfmt()
        if not self.msgfmt:
            raise RuntimeError('msgfmt is not found!')

    def parse(self):
        self._check_msgfmt_or_raise()

        for po_file in os.listdir('i18n'):
            if not po_file.endswith('.po'):
                continue

            po_path = os.path.join('i18n', po_file)

            print(f'INFO: start to parse po file: {po_path}')
            mo_file = self.parse_po_file(po_path)
            if not os.path.isfile(mo_file):
                raise RuntimeError(f'mo file {mo_file} not found')

            language, _ = os.path.splitext(po_file)
            locale_path = os.path.join('i18n', 'locale', language,
                                       'LC_MESSAGES', 'vstackboard.mo')
            if not os.path.exists(os.path.dirname(locale_path)):
                os.makedirs(os.path.dirname(locale_path))
            shutil.move(mo_file, locale_path)

        if os.path.exists(os.path.join('vstackboard', 'locale')):
            shutil.rmtree(os.path.join('vstackboard', 'locale'))
        shutil.move(os.path.join('i18n', 'locale'), 'vstackboard')


class LinuxMsgfmtDriver(MsgFmtDriver):

    def get_msgfmt(self):
        status, output = self._run_cmd(['which', 'msgfmt'])
        if status == 0:
            return output

    def parse_po_file(self, po_path) -> str:
        output = os.path.basename(po_path)
        name, _ = os.path.splitext(output)
        mo_file = os.path.join(os.path.dirname(po_path), f'{name}.mo')
        cmd = [self.msgfmt, po_path, '-o', mo_file]
        status, output = self._run_cmd(cmd)
        if status != 0 or not mo_file:
            raise RuntimeError(f'run msgfmt failed, {output}')
        return mo_file

    def _check_msgfmt_or_raise(self):
        self.msgfmt = self.get_msgfmt()
        if not self.msgfmt:
            raise RuntimeError('msgfmt is not found!')


class WindowsMsgfmtDriver(MsgFmtDriver):

    def get_msgfmt(self):
        for path in site.getsitepackages():
            msgfmt_path = os.path.join(path, 'Tools', 'i18n', 'msgfmt.py')
            if os.path.isfile(msgfmt_path):
                return msgfmt_path
        raise RuntimeError('msgfmt is not found')

    def parse_po_file(self, po_path) -> str:
        msgfmt_cmd = ['python', self.msgfmt, po_path]
        status, output = subprocess.getstatusoutput(' '.join(msgfmt_cmd))
        if status != 0:
            raise RuntimeError(f'msgfmt faild, {output}')
        name, _ = os.path.splitext(os.path.basename(po_path))
        return os.path.join('i18n', f'{name}.mo')


def _make_i18n():
    driver = WindowsMsgfmtDriver() if system.OS.is_windows() else \
        LinuxMsgfmtDriver()
    driver.parse()


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
