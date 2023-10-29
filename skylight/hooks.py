from easy2use.common import msgfmt


DOMAIN = 'skylight'
I18N_DIR = 'i18n'


def setup_hook(config):
    msgfmt.make_i18n(DOMAIN, I18N_DIR)
