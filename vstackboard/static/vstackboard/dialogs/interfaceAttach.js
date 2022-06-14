import Dialog from './_base.js'
import API from '../api.js'
import { MESSAGE, ALERT } from '../lib.js'
import { serverTable } from '../tables.js'

export class InterfaceAttachDialog extends Dialog {
    constructor (){
        super({server: {}, selectedPorts: [], ports: []})
    }

    commit(){
        this.params.selectedPorts.forEach(item => {
            API.server.interfaceAttach(this.params.server.id, {port_id: item}).then(resp => {
                MESSAGE.success(`网卡 ${item} 挂载成功`);
                serverTable.refresh();
            }).catch(error => {
                MESSAGE.error(`网卡 ${item} 挂载失败`);
            });
        });
        MESSAGE.info(`网卡挂载中 ...`);
        this.hide();
    }
    open(server){
        this.params.server = server;
        this.params.ports = []
        this.params.selectedPorts = [];
        API.port.list({device_id: '+'}).then(resp => {
            this.params.ports = resp.data.ports;
        });
        this.show = true;
    }
}