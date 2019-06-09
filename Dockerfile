FROM centos:latest

ARG APP_HOME=/opt/app-root/src
ARG APP_OWNER_UUID=1000
ARG NODEJS_VERSION=v10.16.0
ARG NODEJS_DISTRO=linux-x64
ENV APP_HOME=$APP_HOME \
    APP_OWNER_UUID=$APP_OWNER_UUID \
    NODEJS_VERSION=$NODEJS_VERSION

#env from original
RUN yum -y update && yum -y install gcc gcc-c++ unzip wget python-setuptools python-devel openldap-devel \
    && easy_install pip supervisor \
    && yum clean all

# ARG PIP_INDEX=https://atksv.mywire.org:8993/nexus/repository/pypi-all/simple
# ENV PIP_INDEX ${PIP_INDEX}

USER root

RUN useradd --no-log-init -u ${APP_OWNER_UUID} -g 0 -ms /bin/bash pyflnuser

RUN bash -c "pip install --upgrade pip" \
  && bash -c "pip install python-ldap==3.1.0"

RUN wget "https://nodejs.org/dist/${NODEJS_VERSION}/node-${NODEJS_VERSION}-linux-x64.tar.xz" -P /tmp \
  && mkdir -p /usr/local/lib/nodejs \
  && cd /tmp && tar -xJf node-${NODEJS_VERSION}-$NODEJS_DISTRO.tar.xz --strip-components=1 --directory /usr/local/lib/nodejs \
  && find /usr/local/lib/nodejs

ENV PATH=/usr/local/lib/nodejs/bin:$PATH


RUN npm config set user 0 && npm config set unsafe-perm true \
    && npm --max_old_space_size=8000 --registry https://registry.npmjs.org/ install -g @angular/cli@1.6.8

#llllll


COPY pyfln-auth ${APP_HOME}/pyfln-auth
COPY pyfln-ui /tmp/pyfln-ui

RUN  bash -c "cd ${APP_HOME}/pyfln-auth && pip install -r requirements.txt"

RUN cd /tmp/pyfln-ui && rm package-lock.json || true \
    && npm config set user 0 && npm config set unsafe-perm true \
    && npm --max_old_space_size=8000 --registry https://registry.npmjs.org/ install --no-optional

RUN cd $APP_BUILD_DIR/ \
    && npm --max_old_space_size=8000 run ng build --prod --verbose --source-map \
    && mkdir -p ${APP_BASE_DIR} \
    && mv /tmp/pyfln-ui/dist/* ${APP_BASE_DIR}/ \
    && cp /tmp/pyfln-ui/files/entrypoint.sh ${APP_BASE_DIR}/ \
    && chmod -R 0775 $APP_BASE_DIR/ \
    && chown -R apache:0 $APP_BASE_DIR/

RUN cp /tmp/pyfln-auth/files/uid_entrypoint ${APP_HOME}/ && \
  chmod -R 0777 ${APP_HOME} && \
  chown -R pyflnuser:root ${APP_HOME} && \
  chmod -R g=u /etc/passwd

EXPOSE 8000

WORKDIR ${APP_HOME}

ENTRYPOINT ["./uid_entrypoint"]

CMD ["/usr/bin/supervisord"]