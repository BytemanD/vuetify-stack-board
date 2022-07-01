from pbr import version

from vstackboard.common import constants


def get_version():
    info = version.VersionInfo(constants.NAME)
    return info.release_string()
