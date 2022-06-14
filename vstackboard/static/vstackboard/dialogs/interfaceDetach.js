import Dialog from './_base.js'
import API from '../api.js';
import { MESSAGE, ALERT } from '../lib.js'
import { serverTable } from '../tables.js'

export class InterfaceDetachDialog extends Dialog {
    constructor (){
        super({server: {}, selectedInterfaces: [], attachments: []})
    }

    commit(){
        this.params.selectedInterfaces.forEach(item => {
            API.server.interfaceDetach(this.params.server.id, item).then(resp => {
                MESSAGE.info(`网卡 ${item} 卸载中 ...`);
                // TODO 循环检查 port 状态判断是否 卸载
                setTimeout(function(){ serverTable.refresh(); }, 5 * 1000);
                this.hide();
            }).catch(error => {
                MESSAGE.error(`网卡 ${item} 卸载失败`);
            });
        });
    }
    open(server){
        this.params.server = server;
        this.params.volumes = []
        this.params.selectedInterfaces = [];
        API.server.interfaceList(this.params.server.id).then(resp => {
            this.params.attachments = resp.data.interfaceAttachments;
        });
        this.show = true;
    }
}
