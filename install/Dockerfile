FROM python:3.9.0

ARG PACKAGE_NAME
ARG EASY2USE=https://api.github.com/repos/fjboy/easy-to-use/releases/latest

COPY $PACKAGE_NAME /tmp/
COPY pip.conf /tmp
RUN mkdir -p ~/.pip/ && cp /tmp/pip.conf ~/.pip \
    && pip install --upgrade pip \
    && pip install wheel cffi>=1.4.1 setuptools_rust tornado requests jinja2 bs4 sqlalchemy pbr \
    && curl -s ${EASY2USE} |awk '/browser_download_url/{print $2}' |sed 's|"||g' | xargs pip3 install \
    && pip install /tmp/$PACKAGE_NAME
RUN mkdir -p /etc/vstackboard && touch /etc/vstackboard/vstackboard.conf

EXPOSE 80

ENTRYPOINT [ "vstackboard", "serve" ]