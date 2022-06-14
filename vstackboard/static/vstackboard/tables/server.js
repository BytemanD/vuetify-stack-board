import DataTable from "./_base.js";
import API from "../api.js";
import { MESSAGE, ALERT } from '../lib.js'

class ServerDataTable extends DataTable {
    constructor() {
        super([{ text: '名字', value: 'name' },
        { text: '宿主机', value: 'OS-EXT-SRV-ATTR:host' },
        { text: '状态', value: 'status' },
        { text: '电源状态', value: 'power_state' },
        { text: '规格', value: 'flavor' },
        { text: '镜像', value: 'image' },
        { text: 'IP地址', value: 'addresses' },
        { text: '操作', value: 'action' },
        ],
            API.server, 'servers', '实例');
        this.imageMap = {}
    }
    checkServerStatusUntil(server, status = 'active', message = null) {
        let self = this;
        API.server.show(server.id).then(resp => {
            server = resp.data.server;
            let serverStatus = server.status;
            if (serverStatus.toLowerCase() == status) {
                if (message) {
                    MESSAGE.success(`${self.name} ${server.name} ${message}`)
                }
                self.refresh();
                return;
            };
            setTimeout(function () {
                self.checkServerStatusUntil(server, status, message)
            }, 5 * 1000);
        });
    }
    stopSelected() {
        let self = this;
        this.selected.forEach(item => {
            self.api.stop(item.id).then(resp => {
                self.checkServerStatusUntil(item, 'shutoff', '已关机')
            });
        });
        MESSAGE.info('关机中 ...')
        this.refresh();
        this.resetSelected();
    }
    startSelected() {
        let self = this;
        this.selected.forEach(item => {
            self.api.start(item.id).then(resp => {
                self.checkServerStatusUntil(item, 'active', '已开机')
            });
        });
        MESSAGE.info('开机中 ...')
        this.refresh();
        this.resetSelected();
    }
    rebootSelected(type = 'SOFT') {
        let self = this;
        this.selected.forEach(item => {
            self.api.reboot(item.id, type).then(resp => {
                self.checkServerStatusUntil(item, 'active', '已重启')
            });
        });
        MESSAGE.info('重启中 ...')
        this.refresh();
        this.resetSelected();
    }
    changePasswordSelected(params) {
        let self = this;
        let password = params.password;
        if (!password) {
            MESSAGE.error(`密码不能为空`)
            return;
        }
        this.selected.forEach(item => {
            self.api.changePassword(item.id, password, params.userName).then(resp => {
                MESSAGE.success(`${self.name} ${item.name} 密码修改成功`)
            }).catch(error => {
                MESSAGE.error(`${self.name} ${item.name} 密码修改失败`)
            });
        });
    }
    getImage(server) {
        let imageId = server.image.id;
        if (!imageId) { return }
        if (Object.keys(this.imageMap).indexOf(imageId) < 0) {
            Vue.set(this.imageMap, imageId, {})
            if (!this.imageMap[imageId].name) {
                API.image.show(imageId).then(resp => {
                    this.imageMap[imageId] = resp.data;
                })
            }
        }
        return this.imageMap[imageId];
    }
}
export default ServerDataTable;