FROM python:3.12.0

ARG BACKEND_PACKAGE_NAME
ARG FRONTEND_PACKAGE_NANME

COPY $FRONTEND_PACKAGE_NANME /usr/share/$FRONTEND_PACKAGE_NANME
COPY $BACKEND_PACKAGE_NAME /tmp
COPY pip.conf /tmp
COPY requirements.txt /tmp

RUN mkdir -p ~/.pip/ \
    && mv /tmp/pip.conf ~/.pip \
    && python -m pip install --progress-bar off --upgrade pip \
    && python -m pip install --progress-bar off -r /tmp/requirements.txt \
    && python -m pip install --progress-bar off /tmp/$BACKEND_PACKAGE_NAME \
    && rm -rf /tmp/$PACKAGE_NAME /tmp/requirements.txt \
    && python -m pip cache purge
RUN mkdir -p /etc/skylight && touch /etc/skylight/skylight.conf

EXPOSE 8081

ENTRYPOINT [ "skylight", "serve", "--static", "/usr/share/skylight-web/static", "--template", "/usr/share/skylight-web" ]
