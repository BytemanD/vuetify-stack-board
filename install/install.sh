CONF_DIR="/etc/vstackboard"

mkdir -p ${CONF_DIR}

if [[ ! -f ${CONF_DIR}/vstackboard.conf ]]; then
    cp etc/vstackboard.conf ${CONF_DIR}
fi

SERVICE_DIR=/usr/lib/systemd/system/
if [[ -f ${SERVICE_DIR}/vstackboard.service ]]; then
    rm -rf ${SERVICE_DIR}/vstackboard.service
fi

cp install/vstackboard.service ${SERVICE_DIR}
systemctl daemon-reload
