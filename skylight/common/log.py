import os
import sys

from loguru import logger
from easy2use.globals import log as root_loger

import logging

TIME_FORMAT_DEFAULT = 'YYYY-MM-DD HH:mm:ss'

DEFAULT_LOG_FOAMAT = f'{{time:{TIME_FORMAT_DEFAULT}}} ' \
                     '{process} {level:7} {message}'
FILE_LOG_FORMAT = f'{{time:{TIME_FORMAT_DEFAULT}}} ' \
                  '{process} {level:7} {message}'

LOG = logger


def basic_config(verbose_count=0, log_file=None):
    global LOG

    logger.configure(handlers=[{
        "sink": log_file or sys.stdout,
        'format': log_file and FILE_LOG_FORMAT or DEFAULT_LOG_FOAMAT,
        "colorize": True,
        "level": "DEBUG" if verbose_count >= 1 else "INFO",
    }])
    if verbose_count and verbose_count >= 2:
        root_loger.basic_config(
            level=logging.DEBUG,
            filename=log_file and os.path.abspath(log_file))
    else:
        root_loger.basic_config(
            level=logging.WARNING,
            filename=log_file and os.path.abspath(log_file))


def getLogger():
    return LOG
