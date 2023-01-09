NAME = 'vstackboard'

CDN = {
    'bootcdn': 'https://cdn.bootcdn.net',
    'jsdelivr': 'https://cdn.jsdelivr.net'
}

AUTH = 'fjboy'
REPO = 'vuetify-stack-board'
RELEASES_API = f'https://api.github.com/repos/{AUTH}/{REPO}/releases'

IMAGE_NAMESPACE = 'fjboy'
IMAGE_TAGS_API = f'https://hub.docker.com/v2/namespaces/{IMAGE_NAMESPACE}' \
                 f'/repositories/{NAME}/tags'
