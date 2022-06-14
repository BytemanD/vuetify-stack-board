CONF_DIR="/etc/vstackboard"

mkdir -p ${CONF_DIR}

if [[ ! -f ${CONF_DIR}/auth.json ]]; then
    cp etc/auth.json ${CONF_DIR}
fi

SERVICE_DIR=/usr/lib/systemd/system/
if [[ -f ${SERVICE_DIR}/vstackboard.service ]]; then
    rm -rf ${SERVICE_DIR}/vstackboard.service
fi

cp install/vstackboard.service ${SERVICE_DIR}
systemctl daemon-reload
