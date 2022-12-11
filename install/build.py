import argparse
import logging
import os
import shutil
import subprocess
import sys

LOG_FORMAT = '%(asctime)s %(process)d %(levelname)s %(name)s:%(lineno)s ' \
             '%(message)s'
FILE_PATH = os.path.abspath(__file__)
INSTALL_DIR = os.path.dirname(FILE_PATH)

DOCKER = 'docker'
PODMAN = 'podman'

CONTAINER_CMD = None


LOG = logging.getLogger(__name__)


def run_popen(cmd):
    LOG.debug('Run: %s', ' '.join(cmd))
    popen = subprocess.Popen(cmd, stdout=sys.stdout)
    popen.wait()
    LOG.debug('Return: %s', popen.returncode)
    return popen.returncode


class DockerCmd(object):
    cmd = DOCKER

    @classmethod
    def build(cls, path='./', network=None, build_args=None, target=None,
              no_cache=False):
        cmd = [cls.cmd, 'build']
        if network:
            cmd.extend(['--network', network])
        if no_cache:
            cmd.append('--no-cache')
        if build_args:
            for arg in build_args:
                cmd.extend(['--build-arg', arg])
        if target:
            cmd.extend(['-t', target])
        cmd.append(path)
        status = run_popen(cmd)
        if status != 0:
            raise RuntimeError(f'docker build return {status}')

    @classmethod
    def tag(cls, image, tag):
        status = run_popen([cls.cmd, 'tag', image, tag])
        if status != 0:
            raise RuntimeError(f'docker tag return {status}')

    @classmethod
    def push(cls, image):
        LOG.info('try to push: %s', image)
        status = run_popen([cls.cmd, 'push', image])
        if status != 0:
            raise RuntimeError(f'docker push return {status}')

    @classmethod
    def tag_and_push(cls, image, tag):
        cls.tag(image, tag)
        cls.push(tag)


class PodmanCmd(DockerCmd):
    cmd = PODMAN


def main():
    global CONTAINER_CMD
    parser = argparse.ArgumentParser(description='vstackboard build tool')
    parser.add_argument('whl_file', help='The file of whl package')
    parser.add_argument('-r', '--push-registry', action='append', nargs='?',
                        help='The registry to push, e.g. docker.io, '
                             'registry1:5100, 125.0.0.1')
    parser.add_argument('-l', '--push-as-latest', action='store_true',
                        help='Push image to registry as latest version')
    parser.add_argument('-n', '--no-cache', action='store_true',
                        help='Force to build')
    parser.add_argument('-c', '--container-cmd', default='docker',
                        choices=['docker', 'podman'], help='Force to build')
    parser.add_argument('-d', '--debug', action='store_true',
                        help='Show debug message')
    args = parser.parse_args()

    logging.basicConfig(level=args.debug and logging.DEBUG or logging.INFO,
                        format=LOG_FORMAT)

    if args.container_cmd == DOCKER:
        CONTAINER_CMD = DockerCmd
    elif args.container_cmd == PODMAN:
        CONTAINER_CMD = PodmanCmd

    whl_file_path = os.path.abspath(args.whl_file)
    LOG.info('whl file path: %s', whl_file_path)
    if not os.path.exists(whl_file_path):
        LOG.error('whl file %s is not exists', args.whl_file)
        return 1
    if not os.path.isfile(whl_file_path):
        LOG.error('invalid path %s, it must be a file')
        return 1

    whl_name = os.path.basename(whl_file_path)
    try:
        whl_version = whl_name.split('-')[1]
        LOG.debug('whl version is %s', whl_version)
    except Exception as e:
        LOG.error(e)
        return 1

    target = f'vstackboard:{whl_version}'
    shutil.copy(whl_file_path, INSTALL_DIR)
    os.chdir(INSTALL_DIR)
    LOG.info('change dir to %s', os.getcwd())

    if not os.path.exists(whl_name):
        LOG.error('file %s not exists', whl_name)
        return 1
    try:
        CONTAINER_CMD.build('./', network='host', target=target,
                            no_cache=args.no_cache,
                            build_args=[f'PACKAGE_NAME={whl_name}'])
        LOG.info('image build success')
    except Exception as e:
        LOG.error('build failed! %s', e)
        return
    finally:
        if os.path.exists(whl_name):
            LOG.debug('clean file %s', whl_name)
            os.remove(whl_name)

    try:
        for registry in args.push_registry or []:
            CONTAINER_CMD.tag_and_push(target, f'{registry}/{target}')

            if args.push_as_latest:
                CONTAINER_CMD.tag_and_push(target,
                                           f'{registry}/vstackboard:latest')

    except Exception as e:
        LOG.error('tag/push failed! %s', e)
        return 1

    LOG.info('vstackboard build completed.')


if __name__ == '__main__':
    sys.exit(main())
