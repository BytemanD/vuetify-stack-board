# -*- coding: UTF-8 -*-
import os
import gettext
import locale

from skylight.common import log

LOG = log.getLogger()


def get_translater():
    project_name = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    locale_path = os.path.join(project_name, 'locale')
    locale_language = locale.getdefaultlocale()[0]
    LOG.debug('locale language: {}', locale_language)
    try:
        return gettext.translation('skylight', locale_path,
                                   [locale_language, "en_US"]).gettext
    except FileNotFoundError:
        return gettext.gettext


_ = get_translater()
