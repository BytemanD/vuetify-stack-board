import argparse
import logging
import os
import sys

from easy2use.globals import log


def main():
    parser = argparse.ArgumentParser('VStackBoard Command')
    parser.add_argument('--develop', action='store_true',
                        help="Run with develop mode")
    parser.add_argument('-d', '--debug', action='store_true',
                        help="Show debug message")
    args = parser.parse_args()

    from vstackboard.common import conf                              # noqa
    from vstackboard import server                                   # noqa

    conf.load_configs()

    level = (args.debug or conf.CONF.debug) and logging.DEBUG or logging.INFO
    if args.develop:
        log.basic_config(level=level)
    else:
        log.basic_config(level=level, filename=conf.CONF.log_file)

    # from gevent import monkey
    # monkey.patch_all()
    server.start(develop=args.develop)


if __name__ == '__main__':
    DEVELOPMENT = True
    sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.pardir)))
    sys.exit(main())
