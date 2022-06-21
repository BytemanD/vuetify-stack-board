import { Utils, MESSAGE } from './lib.js';
import API from './api.js';

import {
    clusterTable,
    netTable, portTable, routerTable,
    serverTable, volumeTable
} from './tables.js';


class Dialog {
    constructor(params) {
        this.show = false;
        this.params = params || {};
    }
    open() {
        this.display()
    }
    display() {
        this.show = true;
    }
    hide() {
        this.show = false;
    }
}

export class NewNetworkDialog extends Dialog {
    constructor() {
        super({
            name: '', shared: false, networkType: '', qosPolicy: '',
            segId: '', dnsDomain: '', azHint: ''
        })
        this.netTypes = ['', 'vlan', 'vxlan', 'flat', 'geneve'];
        this.qosPolices = [''];
    }
    open() {
        this.params.name = Utils.getRandomName('net');
        super.open()
    }
    commit() {
        let data = {
            name: this.params.name,
            shared: this.params.shared,
        }
        if (this.params.networkType != '') { data['provider:network_type'] = this.params.networkType };
        if (this.params.segId != '') { data['provider:segmentation_id'] = this.params.segId };
        if (this.params.qosPolicy != '') { data.qos_policy = this.params.qosPolicy };
        if (this.params.dnsDomain != '') { data.dns_domain = this.params.dnsDomain };
        if (this.params.azHint != '') { data.availability_zone_hints = [this.params.azHint] };

        API.network.post({ network: data }).then(resp => {
            netTable.refresh();
        }).catch(error => {
            MESSAGE.error(`网络 ${this.params.name} 创建失败, ${error.response.data.NeutronError.message}`)
        });
        this.hide()
    }
}

export class NewSubnetDialog extends Dialog {
    constructor() {
        super({
            name: '', network: '', cidr: '192.168.1.0/24', enableDhcp: true,
            ipVersion: 4, gateway: ''
        })
        this.networks = [];
        this.ipVersions = [4, 6]
    }
    randomName() {
        this.params.name = Utils.getRandomName('subnet');
    }
    open() {
        API.network.list().then(resp => {
            this.networks = resp.data.networks
        });
        this.randomName();
        super.open();
    }
    commit() {
        let data = {
            name: this.params.name,
            network_id: this.params.network,
            cidr: this.params.cidr,
            ip_version: this.params.ipVersion,
            enable_dhcp: this.params.enableDhcp,
        }
        if (this.params.gateway != '') { data.gateway = this.params.gateway };

        API.subnet.post({ subnet: data }).then(resp => {
            MESSAGE.success(`子网 ${this.params.name} 创建成功`)
            netTable.refresh();
            netTable.refreshSubnets();
        }).catch(error => {
            MESSAGE.error(`子网 ${this.params.name} 创建失败, ${error.response.data.NeutronError.message}`)
        });
        this.hide()
    }
}

export class NewRouterkDialog extends Dialog {
    constructor() {
        super({ name: '', azHint: '' })
    }
    randomName() {
        this.params.name = Utils.getRandomName('router');
    }
    open() {
        this.randomName();
        super.open();
    }
    commit() {
        let data = { name: this.params.name }
        if (this.params.azHint != '') { data.availability_zone_hints = [this.params.azHint] };
        API.router.post({ router: data }).then(resp => {
            routerTable.refresh();
            this.hide();
        }).catch(error => {
            MESSAGE.error(`路由 ${this.params.name} 创建失败, ${error.response.data.NeutronError.message}`)
            this.hide();
        });
    }
}

export class ServerVolumeDialog extends Dialog {
    constructor() {
        super({ server: {}, attachments: [], volumes: [], selectedVolumes: [] })
    }

    refreshAttachments() {
        API.server.volumeAttachments(this.params.server.id).then(resp => {
            this.params.attachments = resp.data.volumeAttachments;
        });
    }
    refreshAvailableVolumes() {
        API.volume.detail({ status: 'available' }).then(resp => {
            this.params.volumes = resp.data.volumes;
        });
    }
    open(server) {
        this.params.server = server;
        this.params.volumes = []
        this.params.selectedVolumes = [];
        this.refreshAttachments();

        this.refreshAvailableVolumes();

        super.open();
    }
    detach(attachment) {
        API.server.volumeDetach(this.params.server.id, attachment.volumeId).then(resp => {
            MESSAGE.info(`卷 ${attachment.volumeId} 卸载中 ...`);
            Utils.checkVolumeDetached(attachment.volumeId);
        }).catch(error => {
            MESSAGE.error(`卷 ${attachment.volumeId} 卸载失败`);
        });
    }
    checkVolumeAttached(volume_id) {
        let self = this;
        API.volume.show(volume_id).then(resp => {
            let status = resp.data.volume.status;
            if (status == 'in-use') {
                MESSAGE.success(`卷 ${volume_id} 挂载成功`);
                self.refreshAttachments();
                return;
            } else if (status == 'error') {
                MESSAGE.error(`卷 ${volume_id} 挂载失败`);
                return;
            };
            setTimeout(function () {
                self.checkVolumeAttached(volume_id)
            }, 3 * 1000)
        });
    }
    attachSelected() {
        this.params.selectedVolumes.forEach(volume_id => {
            API.server.attachVolume(this.params.server.id, volume_id).then(resp => {
                MESSAGE.info(`卷 ${volume_id} 挂载中 ...`);
                this.checkVolumeAttached(volume_id);
                this.params.selectedVolumes = [];
            }).catch(error => {
                console.error(error);
                MESSAGE.error(`卷 ${volume_id} 挂载失败`);
            });
        });
    }
}

export class ServerInterfaceDialog extends Dialog {
    constructor() {
        super({ server: {}, attachments: [], selected: [] })
        this.ports = [];
    }

    refreshInterfaces() {
        API.server.interfaceList(this.params.server.id).then(resp => {
            this.params.attachments = resp.data.interfaceAttachments;
        });
    }
    refreshPorts() {
        API.port.list({ device_id: '+' }).then(resp => {
            this.ports = resp.data.ports;
        });
    }
    open(server) {
        this.params.server = server;
        this.params.selected = [];
        this.refreshInterfaces();
        this.refreshPorts();
        super.open();
    }
    detach(item) {
        API.server.interfaceDetach(this.params.server.id, item.port_id).then(resp => {
            MESSAGE.info(`网卡 ${item.port_id} 卸载中 ...`);
            // TODO 循环检查 port 状态判断是否 卸载
        }).catch(error => {
            MESSAGE.error(`网卡 ${item.port_id} 卸载失败`);
        });
    }
    attachSelected() {
        this.params.selected.forEach(item => {
            API.server.interfaceAttach(this.params.server.id, { port_id: item }).then(resp => {
                MESSAGE.success(`网卡 ${item} 挂载成功`);
                this.refreshInterfaces();
                this.refreshPorts();
            }).catch(error => {
                MESSAGE.error(`网卡 ${item} 挂载失败`);
            });
        });
        MESSAGE.info(`网卡挂载中 ...`);
    }
}

export class ChangePasswordDialog extends Dialog {
    constructor() {
        super({ password: '', userName: '' });
        this.server = {};
    }
    open(server) {
        this.server = server;
        super.open()
    }
    commit() {
        if (!this.params.password.trim()) {
            ALERT.error(`密码不能为空`)
            return;
        }
        API.server.changePassword(this.server.id, this.params.password.trim(),
            this.params.userName).then(resp => {
                MESSAGE.success(`${this.server.name} 密码修改成功`)
                this.hide()
            }).catch(error => {
                MESSAGE.error(`${this.server.name} 密码修改失败`)
            });
    }
}

export class ChangeServerNameDialog extends Dialog {
    constructor() { super({ newName: '', server: {} }) }

    commit() {
        API.server.put(this.params.server.id,
            {
                server: { name: this.params.newName }
            }).then(resp => {
                this.hide();
                MESSAGE.success('实例名修改成功');
                this.params.server.name = this.params.newName;
            }).catch(error => {
                console.error(error)
                MESSAGE.error('实例名修改失败');
            })
    }
    open(server) {
        this.params.server = server;
        this.params.newName = '';
        this.show = true;
    }
}

export class InterfaceAttachDialog extends Dialog {
    constructor() {
        super({ server: {}, selectedPorts: [], ports: [] })
    }

    commit() {
        this.params.selectedPorts.forEach(item => {
            API.server.interfaceAttach(this.params.server.id, { port_id: item }).then(resp => {
                MESSAGE.success(`网卡 ${item} 挂载成功`);
                serverTable.refresh();
            }).catch(error => {
                MESSAGE.error(`网卡 ${item} 挂载失败`);
            });
        });
        MESSAGE.info(`网卡挂载中 ...`);
        this.hide();
    }
    open(server) {
        this.params.server = server;
        this.params.ports = []
        this.params.selectedPorts = [];
        API.port.list({ device_id: '+' }).then(resp => {
            this.params.ports = resp.data.ports;
        });
        this.show = true;
    }
}

export class InterfaceDetachDialog extends Dialog {
    constructor() {
        super({ server: {}, selectedInterfaces: [], attachments: [] })
    }

    commit() {
        this.params.selectedInterfaces.forEach(item => {
            API.server.interfaceDetach(this.params.server.id, item).then(resp => {
                MESSAGE.info(`网卡 ${item} 卸载中 ...`);
                // TODO 循环检查 port 状态判断是否 卸载
                setTimeout(function () { serverTable.refresh(); }, 5 * 1000);
                this.hide();
            }).catch(error => {
                MESSAGE.error(`网卡 ${item} 卸载失败`);
            });
        });
    }
    open(server) {
        this.params.server = server;
        this.params.volumes = []
        this.params.selectedInterfaces = [];
        API.server.interfaceList(this.params.server.id).then(resp => {
            this.params.attachments = resp.data.interfaceAttachments;
        });
        this.show = true;
    }
}
export class ResizeDialog extends Dialog {
    constructor() {
        super();
        this.server = {};
        this.flavors = [];
        this.oldFlavorRef = ''
        this.flavorRef = '';
    }
    open(server) {
        this.server = server;
        this.oldFlavorRef = this.server.flavor.original_name;
        this.flavors = [];
        API.flavor.detail().then(resp => {
            resp.data.flavors.forEach(item => {
                if (item.name != this.server.flavor.original_name){
                    this.flavors.push(item)
                }
            });
        });
        super.open()
    }
    commit() {
        API.server.resize(this.server.id, this.flavorRef).then(resp => {
            MESSAGE.info(`虚拟机 ${this.server.id} 变更中...`);
            this.hide();
        }).catch(error => {
            MESSAGE.error(`虚拟机 ${this.server.id} 变更失败`);
            this.hide();
        });
    }
}
export class MigrateDialog extends Dialog {
    constructor() {
        super();
        this.servers = [];
        this.liveMigrate = true;
        this.smart = true;
    }
    open() {
        this.servers = serverTable.selected;
        super.open()
    }
    commit() {
        this.servers.forEach(item => {
            console.log(item.status)
            if (item.status.toUpperCase() == 'ACTIVE'){
                MESSAGE.info(`热迁移 ${item.name} ...`)
                API.server.liveMigrate(item.id);
            }else if (item.status.toUpperCase() == 'SHUTOFF') {
                MESSAGE.info(`冷迁移 ${item.name} ...`)
                API.server.migrate(item.id);
            }
        })
    }
}
export class NewClusterDialog extends Dialog {
    constructor() {
        super({
            name: '', authUrl: '', authProject: '', authUser: '',
            authPassword: ''
        })
    }
    commit() {
        if (!this.params.name) { ALERT.error(`环境名不能为空`); return; }

        let data = {
            name: this.params.name,
            authUrl: this.params.authUrl,
            authProject: this.params.authProject,
            authUser: this.params.authUser,
            authPassword: this.params.authPassword
        };
        if (data.name.endsWith('/')){
            data.name = data.name.slice(0, -1);
        }
        API.cluster.add(data).then(resp => {
            MESSAGE.success(`环境 ${this.params.name} 添加成功`);
            clusterTable.refresh();
            this.hide();
        }).catch(error => {
            MESSAGE.error(`环境 ${this.params.name} 添加失败`)
        })
    }

}

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

export class NewFlavorDialog extends Dialog {
    constructor() {
        super({
            id: '', name: '', ram: 2, vcpu: 1, disk: 0, isPublic: true, extrasContent: '',
            extras: [], newKey: '', newValue: ''
        })
        this.ramValues = [256];
        for (var i = 1; i <= 10; i++) {
            this.ramValues.push(this.ramValues[i - 1] * 2)
        }
        this.ramLabels = this.getRamLabels();
    }
    getRamLabels() {
        let labels = []
        this.ramValues.forEach(item => {
            labels.push(Utils.humanRam(item));
        })
        return labels
    }
    getRam() {
        return this.ramValues[this.params.ram];
    }
    commit() {
        if (!this.params.id || !this.params.name) {
            ALERT.error(`规格ID规格和名字不能为空`, 2);
            return;
        }
        let extraSpcs = this.checkExtras();
        if (typeof (extraSpcs) == 'undefined') {
            return;
        }

        API.flavor.create({
            id: this.params.id,
            name: this.params.name,
            ram: this.getRam(),
            vcpus: this.params.vcpu,
            disk: this.params.disk,
            'os-flavor-access:is_public': this.params.isPublic,
        }).then(resp => {
            let flavor = resp.data.flavor;
            MESSAGE.success(`规格 ${this.params.name} 创建成功`);
            if (extraSpcs && Object.keys(extraSpcs).length >= 1) {
                API.flavor.updateExtras(flavor.id, extraSpcs).then(resp2 => {
                    MESSAGE.success(`规格 ${this.params.name} 属性设置成功`);
                    flavorTable.refresh();
                    this.hide()
                });
            } else {
                flavorTable.refresh();
                this.hide()
            }
        })
    }
    checkExtras() {
        let extras = {};
        let extraLines = this.params.extrasContent.split('\n');
        for (var i = 0; i < extraLines.length; i++) {
            let line = extraLines[i];
            if (line.trim() == '') { continue; }
            let kv = line.split('=');
            if (kv.length != 2) {
                ALERT.error(`输入内容有误: ${line}`)
                return;
            }
            let key = kv[0].trim();
            let value = kv[1].trim();
            if (key == '' || value == '') {
                ALERT.error(`输入内容有误: ${line}`)
                return;
            }
            extras[key] = value;
        }
        return extras;
    }
}
export class NewVolumeDialog extends Dialog {
    constructor() {
        super({
            name: '', size: 10, nums: 1, image: '', type: '', snapshot: '',
            snapshots: [], images: [], types: []
        })
    }

    commit() {
        for (var i = 1; i <= this.params.nums; i++) {
            let data = {
                name: this.params.nums > 1 ? `${this.params.name}-${i}` : this.params.name,
                size: parseInt(this.params.size)
            };
            if (this.params.image != '') { data.imageRef = this.params.image; }
            if (this.params.snapshot != '') { data.snapshot_id = this.params.snapshot; }
            if (this.params.type != '') { data.volume_type = this.params.type; }
            API.volume.create(data).then(resp => {
                volumeTable.refresh();
                Utils.checkVolumeStatus(resp.data.volume.id);
            }).catch(error => {
                MESSAGE.error(`${this.params.name} ${this.params.name} 创建失败, ${error.response.data.badRequest.message}`)
            })
        }
        MESSAGE.info(`卷 ${this.params.name} 创建中`);
        this.show = false;
    }
    open() {
        this.params.name = Utils.getRandomName('volume');
        API.snapshot.detail().then(resp => {
            this.params.snapshots = resp.data.snapshots;
            this.params.snapshots.splice(this.params.snapshots, 0, { name: '无', id: '' })
        })
        API.image.list().then(resp => {
            this.params.images = resp.data.images;
            this.params.images.splice(this.params.images, 0, { name: '无', id: '' })
        })
        API.volumeType.list().then(resp => {
            this.params.types.push()
            this.params.types = resp.data.volume_types;
            this.params.types.splice(this.params.types, 0, { name: '无', id: '' })
        })
        this.show = true;
    }
    cleanUpImageShapshot() {
        this.params.image = '';
        this.params.snapshot = '';
    }
}

export class VolumeAttachDialog extends Dialog {
    constructor() {
        super({ volumes: [], server: {}, selectedVolumes: [] })
    }

    commit() {
        this.params.selectedVolumes.forEach(volume_id => {
            API.server.attachVolume(this.params.server.id, volume_id).then(resp => {
                MESSAGE.info(`卷 ${volume_id} 挂载中 ...`);
                this.hide();
                Utils.checkVolumeAttached(volume_id);
            }).catch(error => {
                MESSAGE.error(`卷 ${volume_id} 挂载失败`);
            });
        });
    }
    open(server) {
        this.params.volumes = []
        this.params.selectedVolumes = [];
        API.volume.detail({ status: 'available' }).then(resp => {
            this.params.volumes = resp.data.volumes;
        });
        this.params.server = server;
        this.show = true;
    }
}

export class VolumeDetachDialog extends Dialog {
    constructor() {
        super({ server: {}, selectedVolumes: [], attachments: [] })
    }

    open(server) {
        this.params.server = server;
        this.params.volumes = []
        this.params.selectedVolumes = [];
        API.server.volumeAttachments(this.params.server.id).then(resp => {
            this.params.attachments = resp.data.volumeAttachments.filter(item => { return item.device != '/dev/vda' });
        });
        this.display();
    }
    commit() {
        this.params.selectedVolumes.forEach(volume_id => {
            API.server.volumeDetach(this.params.server.id, volume_id).then(resp => {
                MESSAGE.info(`卷 ${volume_id} 卸载中 ...`);
                Utils.checkVolumeDetached(volume_id);
                this.hide()
            }).catch(error => {
                MESSAGE.error(`卷 ${volume_id} 卸载失败`);
            });
        });
    }
}

export class RouterInterfacesDialog extends Dialog {
    constructor() {
        super()
        this.interfaces = [];
        this.router = {};
        this.selected = [];
        this.subnets = []
    }

    refreshInterfaces() {
        API.port.list({ device_id: this.router.id }).then(resp => {
            this.interfaces = resp.data.ports;
            this.refreshSubnets();
        });
    }
    refreshSubnets() {
        let subnetIds = [];
        this.subnets = [];
        this.interfaces.forEach(item => {
            item.fixed_ips.forEach(fixed_ip => {
                if (subnetIds.indexOf(fixed_ip.subnet_id) < 0){
                    subnetIds.push(fixed_ip.subnet_id)
                }
            })
        })
        API.subnet.list().then(resp => {
            resp.data.subnets.forEach(item => {
                if (subnetIds.indexOf(item.id) < 0){
                    this.subnets.push(item)
                }
            })
        });
    }
    open(router) {
        this.router = router;
        this.selected = [];
        this.refreshInterfaces();
        // this.refreshPorts();
        super.open();
    }
    remove(item) {
        let subneId = item.fixed_ips[0].subnet_id;
        MESSAGE.info(`子网 ${subneId} 移除中`);
        API.router.removeSubnet(this.router.id, subneId).then(resp => {
            MESSAGE.success(`子网 ${subneId} 移除成功`);
            this.refreshInterfaces();
        }).catch(error => {
            MESSAGE.error(`子网 ${subneId} 移除失败`);
        });
    }
    attachSelected() {
        MESSAGE.info(`子网添加中`);
        this.selected.forEach(item => {
            API.router.addInterface(this.router.id, item).then(resp => {
                MESSAGE.success(`子网 ${item} 添加成功`);
                this.refreshInterfaces();
            }).catch(error => {
                MESSAGE.error(`子网 ${item} 添加失败`);
            });
        });
    }
}
export class NewPortDialog extends Dialog {
    constructor() {
        super()
        this.name = '';
        this.networkId = '';
        this.nums = 1;
        this.networks = [];
    }
    randomName() {
        this.name = Utils.getRandomName('port');
    }
    open() {
        this.refreshNetwork();
        this.randomName();
        super.open();
    }
    refreshNetwork(){
        API.network.list().then(resp => {
            this.networks = resp.data.networks;
        });
    }
    commit() {
        for (var i = 1; i <= this.nums; i++) {
            let data = {name: this.nums > 1 ? `${this.name}-${i}` : this.name,
                        network_id: this.networkId};
            API.port.post({ port: data }).then(resp => {
                portTable.refresh();
                MESSAGE.success(`端口 ${this.name} 创建成功`);
            }).catch(error => {
                MESSAGE.error(`端口 ${this.name} 创建失败, ${error.response.data.NeutronError.message}`)
            });
        }
        MESSAGE.info(`端口 ${this.name} 创建中`);
        this.hide();
    }
}

export const newVolume = new NewVolumeDialog()
export const newFlavor = new NewFlavorDialog()
export const changePassword = new ChangePasswordDialog()
export const changeServerName = new ChangeServerNameDialog()
export const volumeAttach = new VolumeAttachDialog()
export const volumeDetach = new VolumeDetachDialog()
export const interfaceDetach = new InterfaceDetachDialog()
export const interfaceAttach = new InterfaceAttachDialog()
export const newServer = new NewServerDialog()
export const newCluster = new NewClusterDialog()
export const newNetDialog = new NewNetworkDialog();
export const newSubnetDialog = new NewSubnetDialog();
export const newRouterDialog = new NewRouterkDialog();
export const serverVolumeDialog = new ServerVolumeDialog();
export const serverInterfaceDialog = new ServerInterfaceDialog();
export const routerInterfacesDialog = new RouterInterfacesDialog();
export const newPortDialog = new NewPortDialog();
export const resizeDialog = new ResizeDialog();
export const migrateDialog = new MigrateDialog();

export default Dialog;
