# coding: utf-8
import argparse
import functools
import inspect
import json
import logging
import os
import shutil
import sys

from easy2use.command import shell

LOG_FORMAT = '%(asctime)s %(process)d %(levelname)-7s %(name)s:%(lineno)s ' \
             '%(message)s'
FILE_PATH = os.path.abspath(__file__)
INSTALL_DIR = os.path.dirname(FILE_PATH)

DOCKER = 'docker'
PODMAN = 'podman'

CONTAINER_CMD = None

LOG = logging.getLogger(__name__)

step_num = 0


def log_step(func):
    func_doc = inspect.getdoc(func)
    step_title = func_doc and func_doc.split('\n')[0] or func.__name__

    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        global step_num

        step_num += 1
        LOG.info('[STEP-%s] %s', '{:0>2}'.format(step_num), step_title)
        return func(*args, **kwargs)

    return wrapper


@log_step
def check_whl_file_and_version(whl_file_path):
    '''检查 whl 文件和版本
    '''
    LOG.debug('----> whl file path: %s', whl_file_path)
    if not os.path.exists(whl_file_path):
        raise RuntimeError(f'whl file {whl_file_path} is not exists')
    if not os.path.isfile(whl_file_path):
        raise RuntimeError('invalid path %s, it must be a file')

    whl_name = os.path.basename(whl_file_path)
    whl_version = whl_name.split('-')[1]
    try:
        LOG.debug('----> whl version is %s', whl_version)
    except Exception as e:
        LOG.error(e)
        raise
    return whl_name, whl_version


@log_step
def check_frontend(frontend_name):
    '''检查前端项目目录
    '''
    frontend_path = os.path.join(frontend_name, 'dist')
    if not os.path.exists(frontend_path):
        raise RuntimeError(f'frontend project {frontend_path} is not exists')


@log_step
def prepare_build_resources(resources: list):
    '''准备构建资源
    '''
    for resource in resources:
        src_path, dst_path = resource[0], resource[1]
        if os.path.exists(dst_path):
            LOG.debug('----> copy %s to %s', src_path, dst_path)
            if os.path.isdir(dst_path):
                shutil.rmtree(dst_path)
            else:
                os.remove(dst_path)

        if os.path.isdir(src_path):
            shutil.copytree(src_path, dst_path)
        else:
            shutil.copy(src_path, dst_path)


@log_step
def update_config_json(config_json_path):
    """更新文件: config.json
    """
    if not os.path.exists(config_json_path):
        LOG.warning('----> config.json file %s not exists', config_json_path)
        return
    with open(config_json_path) as f:
        content = json.load(f)
    if 'backend_url' in content:
        content['backend_url'] = ''
    with open(config_json_path, 'w') as f:
        json.dump(content, f, indent=4)


@log_step
def update_favicon_ico(favicon_file, dst_path):
    """准备文件: favicon.ico
    """
    if not os.path.exists(favicon_file):
        raise RuntimeError(f'favicon file {favicon_file} not exists')
    shutil.move(favicon_file, os.path.join(dst_path, 'favicon.ico'))


@log_step
def build_docker_image(name, version, backend, frontend,
                       no_cache=False):
    """构建 docker 镜像
    """
    os.chdir(INSTALL_DIR)
    LOG.debug('----> changed dir to %s', os.getcwd())

    for f in [backend, frontend]:
        if not os.path.exists(f):
            raise FileNotFoundError(f)

    target = f'{name}:{version}'
    CONTAINER_CMD.build(
        './', network='host', target=target,
        no_cache=no_cache,
        build_args=[f'PACKAGE_NAME={backend}',
                    f'FORWARD_PACKAGE_NANME={frontend}'])
    return target


@log_step
def push_image(image, push_registry, push_as_latest=False):
    """推送 docker 镜像
    """
    # sourcery skip: raise-from-previous-error
    target_latest = f"{image.split(':')[0]}:latest"
    try:
        for registry in push_registry or []:
            CONTAINER_CMD.tag_and_push(image, f'{registry}/{image}')
            if push_as_latest:
                CONTAINER_CMD.tag_and_push(image,
                                           f'{registry}/{target_latest}')
    except Exception as e:
        raise RuntimeError(f'tag/push failed! {e}')


@log_step
def cleanup(resources):
    """清理构建所需的临时文件
    """
    for resource in resources:
        if not os.path.exists(resource):
            continue
        LOG.debug('remove file %s', resource)
        if os.path.isdir(resource):
            shutil.rmtree(resource)
        else:
            os.remove(resource)


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
    parser.add_argument('-c', '--container-cmd', default=shell.DOCKER,
                        choices=[shell.DOCKER, shell.PODMAN],
                        help='Force to build')
    parser.add_argument('-d', '--debug', action='store_true',
                        help='Show debug message')
    args = parser.parse_args()

    logging.basicConfig(level=args.debug and logging.DEBUG or logging.INFO,
                        format=LOG_FORMAT)

    CONTAINER_CMD = shell.get_container_impl(impl=args.container_cmd)

    requirements = 'requirements.txt'
    frontend_name = 'forward'
    whl_file_path = os.path.abspath(args.whl_file)
    frontend_path = os.path.join(frontend_name, 'dist')

    whl_name, whl_version = check_whl_file_and_version(whl_file_path)

    check_frontend(frontend_name)

    join_install_path = functools.partial(os.path.join, INSTALL_DIR)
    prepare_build_resources([
        (whl_file_path, join_install_path(os.path.basename(whl_file_path))),
        (frontend_path, join_install_path(os.path.basename(frontend_name))),
        (requirements, join_install_path(os.path.basename(requirements))),
    ])

    config_json = join_install_path(frontend_name, 'config.json')
    update_config_json(config_json)
    # NOTE: favicon.ico file must put in static path
    update_favicon_ico(join_install_path(frontend_name, 'favicon.ico'),
                       join_install_path(frontend_name, 'static'))

    try:
        target = build_docker_image('vstackboard', whl_version,
                                    whl_name, frontend_name,
                                    no_cache=args.no_cache)
    except Exception as e:
        raise RuntimeError(f'image build failed! {e}')
    finally:
        cleanup([
            os.path.join(INSTALL_DIR, os.path.basename(whl_file_path)),
            os.path.join(INSTALL_DIR, os.path.basename(frontend_name)),
            os.path.join(INSTALL_DIR, requirements),
        ])

    push_image(target, args.push_registry or [],
               push_as_latest=args.push_as_latest)

    LOG.info('构建完成.')


if __name__ == '__main__':
    sys.exit(main())
