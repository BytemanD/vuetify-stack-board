import { Utils, MESSAGE, ALERT, LOG } from './lib.js';
import API from './api.js';

import {
    backupTable,
    clusterTable,
    flavorTable,
    keypairTable,
    netTable, portTable, routerTable,
    serverTable, snapshotTable, volumeTable
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
    async open() {
        this.randomName();
        super.open();
        this.networks = (await API.network.list()).networks
    }
    async commit() {
        let data = {
            name: this.params.name,
            network_id: this.params.network,
            cidr: this.params.cidr,
            ip_version: this.params.ipVersion,
            enable_dhcp: this.params.enableDhcp,
        }
        if (this.params.gateway != '') { data.gateway = this.params.gateway };

        try {
            await API.subnet.post({ subnet: data })
            this.hide();
            MESSAGE.success(`子网 ${this.params.name} 创建成功`)
            await netTable.refreshSubnets();
            netTable.refresh();
        } catch {
            // MESSAGE.error(`子网 ${this.params.name} 创建失败, ${error.response.data.NeutronError.message}`)
            MESSAGE.error(`子网 ${this.params.name} 创建失败`)

        }
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
    async commit() {
        let data = { name: this.params.name }
        if (this.params.azHint != '') { data.availability_zone_hints = [this.params.azHint] };
        try {
            await API.router.post({ router: data });
            this.hide();
            MESSAGE.success(`路由 ${this.params.name} 创建成功`)
            routerTable.refresh();
        } catch {
            // MESSAGE.error(`路由 ${this.params.name} 创建失败, ${error.response.data.NeutronError.message}`)
            MESSAGE.error(`路由 ${this.params.name} 创建失败`)
        }
    }
}

export class ServerVolumeDialog extends Dialog {
    constructor() {
        super({ server: {}, attachments: [], volumes: [], selectedVolumes: [] })
    }

    async refreshAttachments() {
        this.params.attachments = (
            await API.server.volumeAttachments(this.params.server.id)
        ).volumeAttachments;
    }
    async refreshAvailableVolumes() {
        this.params.volumes = (
            await API.volume.detail({ status: 'available' })
        ).volumes;
    }
    open(server) {
        this.params.server = server;
        this.params.volumes = []
        this.params.selectedVolumes = [];
        this.refreshAttachments();
        this.refreshAvailableVolumes();
        super.open();
    }
    async detach(attachment) {
        await API.server.volumeDetach(this.params.server.id, attachment.volumeId)
        MESSAGE.info(`卷 ${attachment.volumeId} 卸载中 ...`);
        await this.waitVolumeStatus(attachment.volumeId, ['available', 'error']);
        MESSAGE.success(`卷 ${attachment.volumeId} 卸载成功`);
        this.refreshAttachments();
    }
    async waitVolumeStatus(volume_id, expectStatus=['available', 'error']) {
        let body = {}
        while (true){
            body = await API.volume.show(volume_id);
            let status = body.volume.status;
            LOG.debug(`wait volume ${volume_id} status to be ${expectStatus}, now: ${status}`)
            if (expectStatus.indexOf(status) >= 0) {
                break;
            }
            await Utils.sleep(3);
        }
        return body
    }
    async attachSelected() {
        for (let i in this.params.selectedVolumes){
            let volume_id = this.params.selectedVolumes[i];
            await API.server.attachVolume(this.params.server.id, volume_id)
            MESSAGE.info(`卷 ${volume_id} 挂载中 ...`);
            await this.waitVolumeStatus(volume_id, ['in-use', 'error']);
            MESSAGE.success(`卷 ${volume_id} 挂载成功`);
            this.refreshAttachments();
        }
    }
}

export class ServerInterfaceDialog extends Dialog {
    constructor() {
        super();
        this.server = {};
        this.attachments = [];
        this.selected = [];
        this.ports = [];
    }

    async refreshInterfaces() {
        this.attachments = (
            await API.server.interfaceList(this.server.id)
        ).interfaceAttachments;
    }
    async refreshPorts() {
        this.selected = [];
        let body = await API.port.list({ device_id: '+' })
        this.ports = body.ports
    }
    open(server) {
        this.server = server;
        this.selected = [];
        this.refreshInterfaces();
        this.refreshPorts();
        super.open();
    }
    async detach(item) {
        await API.server.interfaceDetach(this.server.id, item.port_id);
        MESSAGE.info(`网卡 ${item.port_id} 卸载中 ...`);
        while (true) {
            let detached = true;
            let interfaces = await API.server.interfaceList(this.server.id);
            for (var i in interfaces) {
                if (interfaces[i].port_id == item.port_id) {
                    detached = false;
                }
            }
            if (detached) {
                break;
            }
        }
        MESSAGE.success(`网卡 ${item.port_id} 卸载成功`);
        await this.refreshPorts();
        for (let i in this.attachments) {
            if (this.attachments[i].port_id == item.port_id) {
                this.attachments.splice(i, 1)
                break;
            }
        }
        serverTable.refresh();
    }
    async attachSelected() {
        for (let i in this.selected) {
            let item = this.selected[i];
            MESSAGE.info(`网卡 ${item} 挂载中`);
            await API.server.interfaceAttach(this.server.id, { port_id: item })
            MESSAGE.success(`网卡 ${item} 挂载成功`);
            this.refreshInterfaces();
        }
        this.refreshPorts();
        serverTable.refresh();
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
    async commit() {
        if (!this.params.password.trim()) {
            ALERT.error(`密码不能为空`)
            return;
        }
        await API.server.changePassword(this.server.id, this.params.password.trim(), this.params.userName)
        MESSAGE.success(`${this.server.name} 密码修改成功`)
        this.hide()
    }
}

export class ChangeServerNameDialog extends Dialog {
    constructor() { super({ newName: '', server: {} }) }

    open(server) {
        this.params.server = server;
        this.params.newName = '';
        this.show = true;
    }
    async commit() {
        await API.server.update(this.params.server.id, { name: this.params.newName });
        MESSAGE.success('实例名修改成功');
        serverTable.refresh();
        this.hide();
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
    async open(server) {
        this.server = server;
        this.oldFlavorRef = this.server.flavor.original_name;
        this.flavors = [];
        let body = await API.flavor.detail();
        super.open();
        for (let i in body.flavors){
            let item = body.flavors[i];
            if (item.name != this.server.flavor.original_name) {
                this.flavors.push(item)
            }
        }
    }
    async commit() {
        await API.server.resize(this.server.id, this.flavorRef)
        MESSAGE.info(`虚拟机 ${this.server.id} 变更中...`);
        this.hide();

        await serverTable.waitServerStatus(this.server.id);
        MESSAGE.success(`虚拟机 ${this.server.id} 变更成功`);
        serverTable.refresh();
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
    async commit() {
        for (let i in this.servers) {
            let item = this.servers[i];
            switch (item.status.toUpperCase()) {
                case 'ACTIVE':
                    MESSAGE.info(`热迁移 ${item.name} ...`)
                    await API.server.liveMigrate(item.id)
                    await serverTable.waitServerStatus(item.id);
                    MESSAGE.success(`虚拟机 ${item.id} 迁移完成`);
                    // MESSAGE.error(`虚拟机 ${item.id} 迁移失败`);
                    serverTable.refresh();
                    break;
                case 'SHUTOFF':
                    MESSAGE.info(`冷迁移 ${item.name} ...`)
                    await API.server.migrate(item.id);
                    await serverTable.waitServerStatus(item.id, ['SHUTOFF', 'ERROR'])
                    MESSAGE.success(`虚拟机 ${item.id} 迁移完成`);
                    serverTable.refresh();
                    serverTable.refresh()
                    break;
                default:
                    ALERT.warn(`虚拟机 ${item.name} 状态异常，无法迁移`, 1)
                    break;
            }
        }
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
        if (data.name.endsWith('/')) {
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
    async open() {
        this.params.name = Utils.getRandomName('server');
        this.display()

        this.flavors = (await API.flavor.detail()).flavors;
        this.flavors.sort(function (flavor1, flavor2) { return flavor1.name.localeCompare(flavor2.name) })

        this.images = (await API.image.list()).images;

        this.networks = (await API.network.list()).networks;
        this.networks.splice(this.networks, 0, { name: '', id: null })

        let body = await API.az.detail();
        this.azList = body.availabilityZoneInfo.filter(az => { return az.zoneName != 'internal' });
        this.azList.splice(this.azList, 0, { zoneName: '', hosts: [] })
        this.azHosts = { '无': '' };
        this.azList.forEach(az => { this.azHosts[az.zoneName] = Object.keys(az.hosts); })

    }
    async commit() {
        if (!this.params.name) { ALERT.error(`实例名不能为空`); return; }
        if (!this.params.flavor) { ALERT.error(`请选择规格`); return; }
        if (!this.params.image) { ALERT.error(`请选择镜像`); return; }

        if (!this.params.name) {
            MESSAGE.error(`实例名字不能为空`);
            return;
        }
        let body = await API.server.boot(this.params.name, this.params.flavor, this.params.image,
            {
                minCount: this.params.nums, maxCount: this.params.nums,
                useBdm: this.params.useBdm, volumeSize: this.params.volumeSize,
                networks: this.params.netId ? [{ uuid: this.params.netId }] : 'none',
                az: this.params.az,
                host: this.params.host,
                password: this.params.password,
            }

        )
        MESSAGE.info(`实例 ${this.params.name} 创建中...`);
        this.hide();
        serverTable.refresh();
        await serverTable.waitServerStatus(body.server.id)
        MESSAGE.success(`实例 ${this.params.name} 创建成功`);
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
    async commit() {
        if (!this.params.id || !this.params.name) {
            ALERT.error(`规格ID规格和名字不能为空`, 2);
            return;
        }
        let extraSpcs = this.checkExtras();
        if (typeof (extraSpcs) == 'undefined') {
            return;
        }

        let body = await API.flavor.create({
            id: this.params.id, name: this.params.name,
            ram: this.getRam(), vcpus: this.params.vcpu, disk: this.params.disk,
            'os-flavor-access:is_public': this.params.isPublic
        });
        console.log(body);
        let flavor = body.flavor;
        console.log(extraSpcs)
        await API.flavor.updateExtras(flavor.id, extraSpcs);
        MESSAGE.success(`规格 ${this.params.name} 创建成功`);
        flavorTable.refresh();
        this.hide();
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
export class NewKeypairDialog extends Dialog {
    constructor() {
        super();
        this.keyTypes = ['ssh', 'x509'];
        this.newKeypair = {
            type: 'ssh',
            name: ''
        }
        this.privateKey = ''
    }
    randomName() {
        return this.newKeypair.name = Utils.getRandomName('keypair').replace(/:/g, '');
    }
    open() {
        this.randomName();
        this.privateKey = ''
        super.open();
    }
    async commit() {
        if (!this.newKeypair.name) {
            ALERT.error(`密钥对名字不能为空`);
            return;
        }
        this.newKeypair.name = this.newKeypair.name.trim();
        let body = await API.keypair.post({ keypair: this.newKeypair })
        MESSAGE.success(`密钥对创建成功`)
        this.privateKey = body.keypair.private_key;
        keypairTable.refresh()
    }
}
export class RebuildDialog extends Dialog {
    constructor() {
        super();
        this.server = {};
        this.images = [];
        this.data = { imageRef: '', description: '' };
    }
    randomName() {
        return Utils.getRandomName('keypair').replace(/:/g, '');
    }
    async open(server) {
        this.server = server;
        this.images = [{ id: '', name: '' }];
        this.data.imageRef = ''
        let body = await API.image.list();
        this.images = this.images.concat(body.images);
        super.open();
    }
    async commit() {
        await API.server.rebuild(this.server.id, this.data)
        MESSAGE.info(`虚拟机${this.server.name}重建中`)
        super.hide();
        await serverTable.waitServerStatus(this.server.id)
        MESSAGE.success(`虚拟机${this.server.name}重建成功`)
    }
}
export class NewVolumeDialog extends Dialog {
    constructor() {
        super({
            name: '', size: 10, nums: 1, image: '', type: '', snapshot: '',
            snapshots: [], images: [], types: []
        })
    }
    async waitVOlumeCreated(volume){
        await API.volume.waitVolumeStatus(volume.id);
        MESSAGE.success(`卷 ${volume.name} 创建成功`);
        volumeTable.refresh();
    }
    async commit() {
        for (var i = 1; i <= this.params.nums; i++) {
            let data = {
                name: this.params.nums > 1 ? `${this.params.name}-${i}` : this.params.name,
                size: parseInt(this.params.size)
            };
            if (this.params.image != '') { data.imageRef = this.params.image; }
            if (this.params.snapshot != '') { data.snapshot_id = this.params.snapshot; }
            if (this.params.type != '') { data.volume_type = this.params.type; }
            let body = await API.volume.create(data)
            this.waitVOlumeCreated(body.volume)
        }
        MESSAGE.info(`卷 ${this.params.name} 创建中`);
        this.hide();
    }
    async open() {
        this.params.name = Utils.getRandomName('volume');
        super.open();
        let body = await API.snapshot.detail();
        this.params.snapshots = body.snapshots;
        this.params.snapshots.splice(this.params.snapshots, 0, { name: '无', id: '' })

        body = await API.image.list();
        this.params.images = body.images;
        this.params.images.splice(this.params.images, 0, { name: '无', id: '' })
        body = await API.volumeType.list();
        this.params.types = body.volume_types;
        this.params.types.splice(this.params.types, 0, { name: '无', id: '' })

    }
    cleanUpImageShapshot() {
        this.params.image = '';
        this.params.snapshot = '';
    }
}

export class NewSnapshotDialog extends Dialog {
    constructor() {
        super();
        this.name = '';
        this.volume_id = '';
        this.volumes = [];
        this.force = false;
        this.description = '';
        this.metadata = {}
    }
    randomName() {
        return this.name = Utils.getRandomName('snapshot');
    }
    async commit() {
        if (! this.name) { ALERT.error(`快照名不能为空`); return; }
        if (! this.volume_id) { ALERT.error(`请选择一个卷`); return; }
        let data = {
            name: this.name,
            volume_id: this.volume_id,
            metadata: this.metadata,
            force: this.force,
        }
        if (this.description){
            data.description = this.description
        }
        let body = await API.snapshot.create(data);
        MESSAGE.info(`快照 ${this.name} 创建中`);
        this.hide();
        await snapshotTable.waitSnapshotCreated(body.snapshot.id)
        MESSAGE.success(`快照 ${this.name} 创建成功`);
    }
    async open() {
        this.randomName();
        super.open();
        let body = await API.volume.list();
        this.volumes = body.volumes;
    }
}
export class NewBackupDialog extends Dialog {
    constructor() {
        super();
        this.name = '';
        this.volume_id = '';
        this.snapshot_id = ''
        this.volumes = [];
        this.description = '';
        this.force = true;
        this.incremental = false;
    }
    randomName() {
        return this.name = Utils.getRandomName('backup');
    }
    async commit() {
        if (! this.name) { ALERT.error(`备份名不能为空`); return; }
        if (! this.volume_id) { ALERT.error(`请选择一个卷`); return; }
        let data = {
            name: this.name,
            incremental: this.incremental,
            volume_id: this.volume_id,
            force: this.force,
        }
        if (this.description){
            data.description = this.description
        }
        let backup = (await API.backup.create(data)).backup;
        MESSAGE.info(`备份 ${this.name} 创建中`);
        this.hide();
        let result = await backupTable.waitBackupCreated(backup.id);
        if (result.status == 'error') {
            MESSAGE.error(`备份 ${this.name} 创建失败`);
        } else {
            MESSAGE.success(`备份 ${this.name} 创建成功`);
        }
    }
    async open() {
        this.randomName();
        super.open();
        this.volumes = (await API.volume.list()).volumes;
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

    async refreshInterfaces() {
        this.interfaces = (await API.port.list({ device_id: this.router.id })).ports;
        this.refreshSubnets();
    }
    async refreshSubnets() {
        let subnetIds = [];
        this.interfaces.forEach(item => {
            item.fixed_ips.forEach(fixed_ip => {
                if (subnetIds.indexOf(fixed_ip.subnet_id) < 0) {
                    subnetIds.push(fixed_ip.subnet_id)
                }
            })
        })
        this.subnets = [];
        (await API.subnet.list()).subnets.forEach(item => {
            if (subnetIds.indexOf(item.id) < 0) {
                this.subnets.push(item)
            }
        })
    }
    open(router) {
        this.router = router;
        this.selected = [];
        super.open();
        this.refreshInterfaces();
    }
    async remove(item) {
        let subneId = item.fixed_ips[0].subnet_id;
        MESSAGE.info(`子网 ${subneId} 移除中`);
        await API.router.removeSubnet(this.router.id, subneId)
        MESSAGE.success(`子网 ${subneId} 移除成功`);
        this.refreshInterfaces();
    }
    async attachSelected() {
        MESSAGE.info(`子网添加中`);
        for (let i in this.selected){
            let item = this.selected[i];
            await  API.router.addInterface(this.router.id, item)
            MESSAGE.success(`子网 ${item} 添加成功`);
            this.refreshInterfaces();
        }
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
        this.randomName();
        this.refreshNetwork();
        super.open();
    }
    async refreshNetwork() {
        this.networks = (await API.network.list()).networks;
    }
    async commit() {
        MESSAGE.info(`端口 ${this.name} 创建中`);
        for (var i = 1; i <= this.nums; i++) {
            let data = {
                name: this.nums > 1 ? `${this.name}-${i}` : this.name,
                network_id: this.networkId
            };
            await API.port.post({ port: data })
            MESSAGE.success(`端口 ${this.name} 创建成功`);
            portTable.refresh();
            // MESSAGE.error(`端口 ${this.name} 创建失败, ${error.response.data.NeutronError.message}`)
        }
        this.hide();
    }
}

export const newCluster = new NewClusterDialog()

export const newServer = new NewServerDialog()
export const serverVolumeDialog = new ServerVolumeDialog();
export const serverInterfaceDialog = new ServerInterfaceDialog();
export const newFlavor = new NewFlavorDialog()
export const changePassword = new ChangePasswordDialog()
export const changeServerName = new ChangeServerNameDialog()
export const resizeDialog = new ResizeDialog();
export const migrateDialog = new MigrateDialog();
export const newKeypairDialog = new NewKeypairDialog();
export const rebuildDialog = new RebuildDialog();

export const newVolume = new NewVolumeDialog()
export const newSnapshotDialog = new NewSnapshotDialog();
export const newBackupDialog = new NewBackupDialog();

export const newRouterDialog = new NewRouterkDialog();
export const newNetDialog = new NewNetworkDialog();
export const newSubnetDialog = new NewSubnetDialog();
export const routerInterfacesDialog = new RouterInterfacesDialog();
export const newPortDialog = new NewPortDialog();

export default Dialog;
