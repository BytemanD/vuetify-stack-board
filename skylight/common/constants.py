import re

NAME = 'skylight'

AUTH = 'BytemanD'
REPO = 'vuetify-stack-board'
RELEASES_API = f'https://api.github.com/repos/{AUTH}/{REPO}/releases'

IMAGE_NAMESPACE = 'fjboy'
IMAGE_TAGS_API = f'https://hub.docker.com/v2/namespaces/{IMAGE_NAMESPACE}' \
                 f'/repositories/{NAME}/tags'

ADMIN_PASSWORD = 'skylight123'

REG_API_VERSION = re.compile(r'.*/v[\d.]')
