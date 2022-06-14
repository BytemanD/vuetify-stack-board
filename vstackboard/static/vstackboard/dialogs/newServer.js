import { Utils, ALERT, MESSAGE } from '../lib.js'
import Dialog from './_base.js'
import API from '../api.js'
import {serverTable} from '../tables.js'

export class NewServerDialog extends Dialog {
    constructor() {
        super({
            name: '', flavor: '', image: '', netId: '',
            useBdm: true, volumeSize: 40,
            nums: 1, az: '', host: '',
            password: ''
        })
        this.flavors = [];
        this.images = [];
        this.networks = [];
        this.azs = [];
        this.hosts = [];
        this.azHosts = {};
    }
    open() {
        this.params.name = Utils.getRandomName('server');

        API.flavor.detail().then(resp => {
            this.flavors = resp.data.flavors;
            this.flavors.sort(function (flavor1, flavor2) { return flavor1.name.localeCompare(flavor2.name) })
        })
        API.image.list().then(resp => {
            this.images = resp.data.images;
        })
        API.network.list().then(resp => {
            this.networks = resp.data.networks;
            this.networks.splice(this.networks, 0, { name: '无', id: null })
        })
        API.az.detail().then(resp => {
            this.azList = resp.data.availabilityZoneInfo.filter(az => { return az.zoneName != 'internal' });
            this.azList.splice(this.azList, 0, { zoneName: '无', hosts: [] })
            this.azHosts = { '无': '' };
            this.azList.forEach(az => { this.azHosts[az.zoneName] = Object.keys(az.hosts); })
        });
        this.display()
    }
    commit() {
        if (!this.params.name) { ALERT.error(`实例名不能为空`); return; }
        if (!this.params.flavor) { ALERT.error(`请选择规格`); return; }
        if (!this.params.image) { ALERT.error(`请选择镜像`); return; }

        if (!this.params.name) {
            MESSAGE.error(`实例名字不能为空`);
            return;
        }
        API.server.boot(this.params.name, this.params.flavor, this.params.image,
            {
                minCount: this.params.nums, maxCount: this.params.nums,
                useBdm: this.params.useBdm, volumeSize: this.params.volumeSize,
                networks: this.params.netId ? [{ uuid: this.params.netId }] : 'none',
                az: this.params.az,
                host: this.params.host,
                password: this.params.password,
            }
        ).then(resp => {
            MESSAGE.info(`实例 ${this.params.name} 创建中...`);
            this.hide();
            serverTable.refresh();
            this.checkServerStatus(resp.data.server.id);
        })
    }
    checkServerStatus(server_id, oldStatus = '', oldTaskState = '') {
        API.server.show(server_id).then(resp => {
            let status = resp.data.server.status;
            let taskState = resp.data.server['OS-EXT-STS:task_state'];
            switch (status.toUpperCase()) {
                case 'ACTIVE':
                    MESSAGE.success(`实例 ${server_id} 创建成功`);
                    break;
                case 'ERROR':
                    MESSAGE.error(`实例 ${volume_id} 创建失败`);
                    break;
                default:
                    let self = this;
                    setTimeout(function () { self.checkServerStatus(server_id, status, taskState) }, 5 * 1000);
                    break;
            }
            if ((oldTaskState && taskState && oldTaskState.toUpperCase() != taskState.toUpperCase()) ||
                (oldStatus && status && oldStatus.toUpperCase() != status.toUpperCase())) {
                serverTable.refresh();
            }
        });
    }
}
