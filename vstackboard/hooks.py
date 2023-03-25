from easy2use.common import msgfmt


VSTACKBOARD = 'vstackboard'
I18N_DIR = 'i18n'


def setup_hook(config):
    msgfmt.make_i18n(VSTACKBOARD, I18N_DIR)
