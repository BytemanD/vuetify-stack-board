FROM python:3.9.0

ARG PACKAGE_NAME

COPY $PACKAGE_NAME /tmp/
COPY pip.conf /tmp
RUN mkdir -p ~/.pip/ && cp /tmp/pip.conf ~/.pip \
    && pip install --upgrade pip \
    && pip install wheel cffi>=1.4.1 setuptools_rust tornado requests jinja2 bs4 sqlalchemy pbr \
    && pip install https://github.com/fjboy/easy-to-use/releases/download/1.0.1/easy2use-1.0.1-py3-none-any.whl \
    && pip install /tmp/$PACKAGE_NAME
RUN mkdir -p /etc/vstackboard && touch /etc/vstackboard/vstackboard.conf

EXPOSE 80

ENTRYPOINT [ "vstackboard", "serve" ]