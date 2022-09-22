import { Utils, MESSAGE, ALERT, LOG, ServerTasks, Alert } from './lib.js';
import API from './api.js';

import {
    backupTable,
    clusterTable,
    flavorTable,
    imageTable,
    keypairTable,
    netTable, portTable, projectUserDialog, qosPolicyTable, roleTable, routerTable,
    serverTable, sgTable, snapshotTable, volumeTable, volumeTypeTable
} from './objects.js';
import { UserTable } from './tables.js';


class Dialog {
    constructor(params) {
        this.show = false;
        this.params = params || {};
        this.errorMessage = null;
    }
    open() {
        this.errorMessage = null;
        this.display()
    }
    display() {
        this.show = true;
    }
    hide() {
        this.show = false;
    }
    checkNotNull(value) {
        if (! value) {
            return '该选项不能为空';
        }
        return true;
    }
}

export class ProjectUserDialog extends Dialog {
    constructor() {
        super();
        this.project = {};
        this.userTable = new UserTable();
        this.netTypes = ['vlan', 'vxlan', 'flat', 'geneve'];
        this.qosPolices = [];

        this.newUserDialog = new NewUserDialog();
    }
    async refresh(){
        let roleAssignments = await API.roleAssignments.listByProject(this.project.id);
        let users = [];
        for (let i in roleAssignments) {
            let userId = roleAssignments[i].user.id;
            users.push((await API.user.show(userId)).user)
        }
        this.userTable.items = users;
    }
    async open(project) {
        this.project = project;
        this.userTable.items = [];
        this.refresh();
        super.open();
    }
     async deleteSelected() {
        for(let i in this.userTable.selected){
            let user = this.userTable.selected[i];
            await API.user.delete(user.id);
        }
        this.userTable.selected = [];
        MESSAGE.success(`用户删除成功`);
        this.refresh(false);
    }

}
export class NewUserDialog extends Dialog {
    constructor() {
        super();
        this.name = '';
        this.password = null;
        this.userRole = null;
        this.roles = [];
    }
    randomName() {
        this.name = Utils.getRandomName('user');
    }
    async open(project) {
        this.randomName();
        this.project = project;
        super.open();
        this.roles = (await API.role.list()).roles;
    }
    async commit() {
        if (! this.name) { ALERT.warn(`用户名必须指定`); return; }
        if (! this.userRole) { ALERT.warn(`用户角色不能为空`); return; }
        let data = {
            name: this.name,
            project_id: this.project.id,
        }
        if (this.password) { data.password = this.password };
        try {
            let user = (await API.user.post({ user: data })).user
            if (this.userRole) {
                await API.project.addUser(this.project.id, user.id, this.userRole);
            };
            MESSAGE.success(`用户 ${this.name} 创建成功`)
            projectUserDialog.refresh();
            super.hide();
        } catch {
            MESSAGE.error(`用户 ${this.name} 创建失败`)
        }
    }
    checkUserRole(value) {
        return !!value || '用户角色不能为空.';
    }
}
export class NewDomainDialog extends Dialog {
    constructor() {
        super();
        this.name = '';
        this.enabled = true;
        this.description = null;
    }
    randomName() {
        this.name = Utils.getRandomName('domain');
    }
    async open() {
        this.randomName();
        super.open();
    }
    async commit() {
        if (! this.name) { ALERT.warn(`Domain名不能为空`); return; }
        let data = { name: this.name, enabled: this.enabled }
        if (this.description) { data.description = this.description };
        try {
            await API.domain.post({ domain: data })
            MESSAGE.success(`域 ${this.name} 创建成功`)
            super.hide();
            return true;
        } catch {
            MESSAGE.error(`域 ${this.name} 创建失败`)
            return false;
        }
    }
}
export class NewProjectDialog extends Dialog {
    constructor() {
        super();
        this.name = '';
        this.enabled = true;
        this.description = null;
        this.domainId = 'default';
        this.domains = [];
    }
    randomName() {
        this.name = Utils.getRandomName('project');
    }
    async open() {
        this.randomName();
        this.domains = (await API.domain.list()).domains;
        super.open();
    }
    async commit() {
        if (! this.name) { ALERT.warn(`租户名不能为空`); return; }
        let data = { name: this.name, enabled: this.enabled }
        if (this.description) { data.description = this.description };
        if (this.domainId) { data.domain_id = this.domainId };
        try {
            await API.project.post({ project: data })
            MESSAGE.success(`租户 ${this.name} 创建成功`)
            super.hide();
            return true;
        } catch {
            MESSAGE.error(`租户 ${this.name} 创建失败`)
            return false;
        }
    }
}
export class RolesDialog extends Dialog {
    constructor() {
        super();
        this.domains = [];
        this.domainId = null;
        this.roleTable = roleTable;
    }
    randomName() {
        this.name = Utils.getRandomName('user');
    }
    async changeDoamin(){
        this.roleTable.domainId = this.domainId;
        this.roleTable.refresh()
    }
    async open() {
        this.domains = (await API.domain.list()).domains;
        this.changeDoamin();
        super.open();
    }
}
export class NewRoleDialog extends Dialog {
    constructor() {
        super();
        this.name = '';
        this.domainId = null;
        this.domains = [];
    }
    randomName() {
        this.name = Utils.getRandomName('role');
    }
    async open() {
        this.randomName();
        this.domains = (await API.domain.list()).domains;
        super.open();
    }
    async commit() {
        if (! this.name) {
            ALERT.warn(`角色名必须指定`)
            return;
        }
        let data = { name: this.name }
        if (this.domainId) {
            data.domain_id = this.domainId
        }
        try {
            await API.role.post({ role: data });
            MESSAGE.success(`角色 ${this.name} 创建成功`);
            roleTable.refresh();
            super.hide();
        } catch {
            MESSAGE.error(`角色 ${this.name} 创建失败`)
        }
    }
}

export class NewNetworkDialog extends Dialog {
    constructor() {
        super({
            name: '', shared: false, networkType: null, qosPolicy: '',
            segId: '', dnsDomain: '', azHint: ''
        })
        this.netTypes = ['vlan', 'vxlan', 'flat', 'geneve'];
        this.qosPolices = [];
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
        if (this.params.networkType) { data['provider:network_type'] = this.params.networkType };
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
        this.networks = (await API.network.list()).networks;
    }
    checkCidr(value){
        if (!value){ return '子网cidr不能为空' }
        value = value.trim();
        if (value.indexOf('/') < 0){ return '非法的cidr'; }
        let items = value.split('/');
        if ( items[1].search(/^[0-9]+$/) < 0 || parseInt(items[1]) > 32){ return '非法的cidr'; }
        let ipList = items[0].split('.');
        for (let i in ipList){
            console.log(`${ipList[i]} ${parseInt(ipList[i])}`)
            if ( ipList[i].search(/^[0-9]+$/) < 0 || parseInt(ipList[i]) > 255){ return '非法的cidr'; }
        }
        return true;
    }
    async commit() {
        if (! this.params.network){
            ALERT.error(`请选择网络`)
            return;
        }
        let data = {
            name: this.params.name,
            network_id: this.params.network,
            cidr: this.params.cidr,
            ip_version: this.params.ipVersion,
            enable_dhcp: this.params.enableDhcp,
        }
        if (this.params.gateway != '') { data.gateway = this.params.gateway };
        this.errorMessage = null;
        try {
            await API.subnet.post({ subnet: data })
            this.hide();
            MESSAGE.success(`子网 ${this.params.name} 创建成功`)
            await netTable.refreshSubnets();
            netTable.refresh();
        } catch (error) {
            this.errorMessage = error.response.data.NeutronError.message;
            MESSAGE.error(`子网 ${this.params.name} 创建失败.`)
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
    async waitVolumeStatus(volume_id, expectStatus = ['available', 'error']) {
        let body = {}
        while (true) {
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
        for (let i in this.params.selectedVolumes) {
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
        this.netSelected = [];
        this.ports = [];
        this.networks = [];
    }

    async refreshInterfaces() {
        this.attachments = (
            await API.server.interfaceList(this.server.id)
        ).interfaceAttachments;
    }
    async refreshPorts() {
        this.selected = [];
        this.netSelected = [];
        this.ports = (await API.port.list({ device_id: '+' })).ports
    }
    async open(server) {
        this.server = server;
        this.selected = [];
        this.refreshInterfaces();
        this.refreshPorts();
        super.open();
        this.networks = (await API.network.list()).networks;
        console.log(this.networks)
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
    async attachSelectedNets() {
        for (let i in this.netSelected) {
            let item = this.netSelected[i];
            MESSAGE.info(`网卡 ${item} 挂载中`);
            await API.server.interfaceAttach(this.server.id, { net_id: item })
            MESSAGE.success(`网卡 ${item} 挂载成功`);
            this.refreshInterfaces();
        }
        serverTable.refresh();
    }
    parseFixedIps(item){
        let ips = []
        for (let i in item.fixed_ips){
            let fixedIp = item.fixed_ips[i];
            ips.push(fixedIp['ip_address'])
        }
        return ips
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
        for (let i in body.flavors) {
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
        let newServer = await serverTable.waitServerStatus(this.server.id);
        if (newServer.flavor.original_name == this.oldFlavorRef) {
            MESSAGE.error(`虚拟机 ${this.server.id} 变更失败`);
        } else {
            MESSAGE.success(`虚拟机 ${this.server.id} 变更成功`);
        }
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
    async liveMigrateAndWait(server){
        MESSAGE.info(`热迁移 ${server.name} ...`)
        await API.server.liveMigrate(server.id)
        await serverTable.waitServerStatus(server.id);
        MESSAGE.success(`虚拟机 ${server.id} 迁移完成`);
        serverTable.refresh();
    }
    async migrateAndWati(server){
        MESSAGE.info(`冷迁移 ${server.name} ...`)
        await API.server.migrate(server.id);
        await serverTable.waitServerStatus(server.id, ['SHUTOFF', 'ERROR'])
        MESSAGE.success(`虚拟机 ${server.id} 迁移完成`);
        serverTable.refresh();
    }
    async commit() {
        for (let i in this.servers) {
            let item = this.servers[i];
            if (['ACTIVE', 'SHUTOFF'].indexOf(item.status) < 0){
                ALERT.warn(`虚拟机 ${item.name} 状态异常，无法迁移`, 1)
                continue
            }
            if (this.smart){
                switch (item.status.toUpperCase()) {
                    case 'ACTIVE':
                        this.liveMigrateAndWait(item); break;
                    case 'SHUTOFF':
                        this.migrateAndWati(item); break;
                    default:
                        break;
                }
                continue
            }
            if (this.liveMigrate && item.status.toUpperCase() == 'ACTIVE') {
                this.liveMigrateAndWait(item);
            } else if(!this.liveMigrate && item.status.toUpperCase() == 'SHUTOFF') {
                this.migrateAndWati(item)
            } else {
                ALERT.warn(`虚拟机 ${item.name} 状态异常，无法迁移`, 1)
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
        this.hidePassword = true;
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
        this.keypairs = [];
        this.keypair = '';
        this.volumeType = '';
        this.securityGroup = null;
        this.volumeTypes = [];
        this.securityGroups = [];
    }
    async open() {
        this.params.name = Utils.getRandomName('server');
        this.display()
        if (!this.params.az) {
            this.params.az = '自动选择';
        }
        this.flavors = (await API.flavor.detail()).flavors;
        this.flavors.sort(function (flavor1, flavor2) { return flavor1.name.localeCompare(flavor2.name) })
        this.volumeTypes = (await API.volumeType.list()).volume_types;
        this.images = (await API.image.list()).images;
        this.networks = (await API.network.list()).networks;
        this.keypairs = (await API.keypair.list()).keypairs;

        let authInfo = await API.authInfo.get();
        this.securityGroups = (await API.sg.list({tenant_id: authInfo.project.id})).security_groups;

        let body = await API.az.detail();
        this.azList = body.availabilityZoneInfo.filter(az => { return az.zoneName != 'internal' });
        this.azHosts = {};
        if (this.azList){
            this.azList.forEach(az => { this.azHosts[az.zoneName] = Object.keys(az.hosts || {}); })
        } else {
            console.warn(`azList is null: ${this.azList}`)
        }
    }
    async commit() {
        if (!this.params.name) { ALERT.error(`实例名不能为空`); return; }
        if (!this.params.flavor) { ALERT.error(`请选择规格`); return; }
        if (!this.params.image) { ALERT.error(`请选择镜像`); return; }

        if (!this.params.name) {
            MESSAGE.error(`实例名字不能为空`);
            return;
        }
        let data = {
            minCount: this.params.nums, maxCount: this.params.nums,
            useBdm: this.params.useBdm, volumeSize: this.params.volumeSize,
            networks: this.params.netId ? [{ uuid: this.params.netId }] : 'none',
            az: this.params.az == '自动选择' ? null : this.params.az,
            host: this.params.host,
            password: this.params.password,
            keyName: this.keypair,
            volumeType: this.volumeType,
        }
        if (this.securityGroup) {
            data.securityGroup = [{name: this.securityGroup}];
        }
        let body = await API.server.boot(this.params.name, this.params.flavor, this.params.image, data)
        MESSAGE.info(`实例 ${this.params.name} 创建中...`);
        let serverTasks = new ServerTasks();
        serverTasks.add(body.server.id, 'building')
        this.hide();
        serverTable.refresh();
        let result = await serverTable.waitServerStatus(body.server.id);
        serverTasks.delete(body.server.id)
        if (result.status.toUpperCase() == 'ERROR') {
            MESSAGE.error(`实例 ${this.params.name} 创建失败`);
        } else {
            MESSAGE.success(`实例 ${this.params.name} 创建成功`);
        }
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
        return this.params.ram * 1024;
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
        let flavor = body.flavor;
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

export class FlavorExtraDialog extends Dialog {
    constructor() {
        super();
        this.flavor = {};
        this.extraSpecs = {};
        this.newExtraSpecs = '';
        this.customizeExtras = [
            { key: 'hw:numa_nodes', value: 1 }, { key: 'hw:numa_nodes', value: 2 },
            { key: 'hw:mem_page_size', value: 'large' },
            { key: 'hw:vif_multiqueue_enabled', value: 'True' },
            { key: 'hw:vif_queues_num', value: 4 }, { key: 'hw:vif_queues_num', value: 8 },
            { key: 'hw:cpu_policy', value: 'dedicated' },

        ]
    }
    async deleteExtra(key) {
        await API.flavor.deleteExtra(this.flavor.id, key);
        MESSAGE.success(`属性 ${key} 删除成功`);
        Vue.delete(this.extraSpecs, key);
        flavorTable.refresh();
    }
    async addExtra(item) {
        if (Object.keys(this.extraSpecs).indexOf(item.key) >= 0 && this.extraSpecs[item.key] == item.value) {
            ALERT.error(`属性 ${item.key} 已经存在`)
            return
        } else {
            let extraSpecs = {}
            extraSpecs[item.key] = item.value;
            await API.flavor.updateExtras(this.flavor.id, extraSpecs);
            MESSAGE.success(`属性 ${item.key} 添加成功`);
            Vue.set(this.extraSpecs, item.key, item.value);
            flavorTable.refresh();
        }
    }
    async addNewExtraSpecs() {
        let extraSpecs = API.flavor.parseExtras(this.newExtraSpecs);
        if (!extraSpecs) {
            return;
        }
        await API.flavor.updateExtras(this.flavor.id, extraSpecs);
        MESSAGE.success(`属性添加成功`);
        for (let key in extraSpecs) {
            Vue.set(this.extraSpecs, key, extraSpecs[key])
        }
        flavorTable.refresh();
    }
    async open(item) {
        this.flavor = item;
        let body = await API.flavor.getExtraSpecs(item.id);
        super.open();
        this.extraSpecs = body.extra_specs;
    }
    async commit() {

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
        this.images = [];
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
export class UpdateServerSG extends Dialog {
    constructor() {
        super();
        this.interfaceHeaders = [
            {text: 'name', value: 'name'},
            {text: 'mac_address', value: 'mac_address'},
            {text: 'fixed_ips', value: 'fixed_ips'},
            {text: 'security_groups', value: 'security_groups'},
        ]
        this.itemsPerPage = 10;
        this.server = {};
        this.interfaces = [];
        this.securityGroups = [];
        this.securityGroup = [];
        this.selectedInterfaces = [];
        this._authInfo = null;
    }
    randomName() {
        return Utils.getRandomName('keypair').replace(/:/g, '');
    }
    async open(server) {
        this.server = server;
        super.open();
        this.interfaces = (await API.port.list({device_id: this.server.id})).ports;
        if (! this._authInfo){
            this._authInfo = await API.authInfo.get();
        }
        this.securityGroups = (await API.sg.list({tenant_id: this._authInfo.project.id})).security_groups;
    }
    async commit() {
        for(let i in this.selectedInterfaces) {
            let port = this.interfaces[i];
            try {
                await API.port.put(port.id, {port: {security_groups: this.securityGroup}});
                MESSAGE.success(`端口${port.name || port.id}更新成功.`);
            } catch {
                MESSAGE.error(`端口${port.name || port.id}更新失败.`);
                return
            }
        }
        this.interfaces = (await API.port.list({device_id: this.server.id})).ports;
    }
}
export class NewVolumeDialog extends Dialog {
    constructor() {
        super({
            name: '', size: 10, nums: 1, image: null, type: null, snapshot: null,
            snapshots: [], images: [], types: []
        })
    }
    async waitVOlumeCreated(volume) {
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
            if (this.params.image) { data.imageRef = this.params.image; }
            if (this.params.snapshot) { data.snapshot_id = this.params.snapshot; }
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
        this.params.images = (await API.image.list()).images;
        this.params.types = (await API.volumeType.list()).volume_types;
    }
    cleanUpImageShapshot() {
        this.params.image = null;
        this.params.snapshot = null;
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
        if (!this.name) { ALERT.error(`快照名不能为空`); return; }
        if (!this.volume_id) { ALERT.error(`请选择一个卷`); return; }
        let data = {
            name: this.name,
            volume_id: this.volume_id,
            metadata: this.metadata,
            force: this.force,
        }
        if (this.description) {
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
        if (!this.name) { ALERT.error(`备份名不能为空`); return; }
        if (!this.volume_id) { ALERT.error(`请选择一个卷`); return; }
        let data = {
            name: this.name,
            incremental: this.incremental,
            volume_id: this.volume_id,
            force: this.force,
        }
        if (this.description) {
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
export class VolumeResetStateDialog extends Dialog {
    constructor(){
        super();
        this.status = null;
        this.attachStatus = null;
        this.resetMigrateStatus = false;
        this.statusList = [
            "available", "error", "creating", "deleting", "in-use", "attaching", "detaching", "error_deleting", "maintenance"
        ]
        this.attachStatusList = ['attached', 'detached']
    }
    async commit() {
        let data = {};
        if (this.status) {data.status = this.status};
        if (this.attachStatus) {data.attach_status = this.attachStatus};
        if (this.resetMigrateStatus) {data.migration_status = null};
        if (Object.keys(data).length == 0 ){
            ALERT.warn(`请至少指定一个要重置的属性。`)
            return;
        }
        for (let i in volumeTable.selected){
            let volume = volumeTable.selected[i];
            await API.volume.resetState(volume.id, data);
            MESSAGE.success(`卷 ${volume.name || volume.id } 状态重置成功`);
            volumeTable.refresh();
        }
    }
}
export class BackupResetStateDialog extends Dialog {
    constructor() {
        super();
        this.status = 'available';
        this.statusList = ['available', 'error']
    }
    async commit() {
        for (let i in backupTable.selected){
            let backup = backupTable.selected[i];
            await API.backup.resetState(backup.id, this.status);
            await backupTable.waitBackupStatus(backup.id, this.status);
            MESSAGE.success(`备份 ${backup.name || backup.id } 状态重置成功`);
            snapshotTable.refresh();
        }
    }
}
export class SnapshotResetStateDialog extends Dialog {
    constructor() {
        super();
        this.status = 'available';
        this.statusList = ["available", "error", "creating", "deleting", "error_deleting"]
    }
    async commit() {
        for (let i in snapshotTable.selected){
            let snapshot = snapshotTable.selected[i];
            await API.snapshot.resetState(snapshot.id, this.status);
            MESSAGE.success(`快照 ${snapshot.name || snapshot.id } 状态重置成功`);
            snapshotTable.refresh();
        }
    }
}

export class NewVolumeTypeDialog extends Dialog {
    constructor() {
        super();
        this.name = '';
        this.backendName = ''
        this.description = '';
        this.private = false;
    }
    randomName() {
        return this.name = Utils.getRandomName('type');
    }
    async commit() {
        let extraSpecs = {};
        if (!this.name) { ALERT.error(`名字不能为空`); return; }
        let data = {
            name: this.name,
            public: ! this.private,
        }
        if (this.description) {
            data.description = this.description;
        }
        if (this.backendName){
            extraSpecs.volume_backend_name = this.backendName;
        }
        if (Object.keys(extraSpecs  ).length > 0){
            data.extra_specs = extraSpecs;
        }
        LOG.debug(`Create volume type ${JSON.stringify(data)}`);
        await API.volumeType.create(data);
        MESSAGE.success(`卷类型 ${this.name} 创建成功`);
        this.hide();
        volumeTypeTable.refresh();
    }
    async open() {
        this.randomName();
        super.open();
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
        for (let i in this.selected) {
            let item = this.selected[i];
            await API.router.addInterface(this.router.id, item)
            MESSAGE.success(`子网 ${item} 添加成功`);
            this.refreshInterfaces();
        }
    }
}
export class NewPortDialog extends Dialog {
    constructor() {
        super()
        this.name = '';
        this.networkId = null;
        this.nums = 1;
        this.networks = [];
        this.vnicTypes = ['normal', 'macvtap', 'direct', 'direct-physical',
                          'baremetal', 'virtio-forwarder', 'vdpa']
        this.vnicType = null;
        this.macAddress = null;
        this.qosPolicies = [];
        this.qosPolicyId = null;
        this.portSecurityEnabled = true;
        this.securityGroups = [];
        this.portSecurityGroups = [];
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
        if (!this.networkId){
            ALERT.error(`请选择网络`);
            return;
        }
        MESSAGE.info(`端口 ${this.name} 创建中`);
        for (var i = 1; i <= this.nums; i++) {
            let data = {
                name: this.nums > 1 ? `${this.name}-${i}` : this.name,
                network_id: this.networkId
            };
            if (this.vnicType){ data['binding:vnic_type'] = this.vnicType }
            if (this.macAddress){ data.mac_address = this.macAddress; }
            if (this.qosPolicyId){ data.qos_policy_id = this.qosPolicyId; }
            if (this.portSecurityEnabled){ data.port_security_enabled = this.portSecurityEnabled; }
            if (this.portSecurityGroups) {data.security_groups = this.portSecurityGroups; }
            await API.port.post({ port: data })
            MESSAGE.success(`端口 ${this.name} 创建成功`);
            portTable.refresh();
        }
        this.hide();
    }
}
export class UpdatePort extends Dialog {
    constructor() {
        super()
        this.securityGroups = [];
        this.qosPolicies = [];

        this.port = {};
        this.portSGs = [];
        this.portQosPolicy = null;
    }
    async open(port) {
        this.port = port;
        this.portSGs = this.port.security_groups;
        this.portQosPolicy = this.port.qos_policy_id;

        super.open();
        let authInfo = await API.authInfo.get();
        this.securityGroups = (await API.sg.list({tenant_id: authInfo.project.id})).security_groups;
        this.qosPolicies = (await API.qosPolicy.list()).policies;
    }
    async commit(){
        let data = {};
        if (this.portSGs != this.port.security_groups) { data.security_groups = this.portSGs; }
        if (this.portQosPolicy != this.port.qos_policy_id) { data.qos_policy_id = this.portQosPolicy; }
        if (! data) {
            ALERT.warn(`端口属性没有变化`)
            return;
        }
        await API.port.put(this.port.id, {port: data});
        MESSAGE.success(`端口 ${this.port.name || this.port.name } 更新成功`)
        portTable.refresh();
    }

}
export class NewQosPolicyDialog extends Dialog {
    constructor() {
        super()
        this.name = null;
        this.isDefault = false;
        this.shared = false;
        this.description = null;
    }
    randomName() {
        this.name = Utils.getRandomName('qosPolicy');
    }
    open() {
        this.randomName();
        super.open();
    }
    async commit() {
        if (!this.name){
            ALERT.error(`请输入名字`);
            return;
        }

        let data = {
            name: this.name,
            is_default: this.isDefault,
            shared: this.shared
        }
        if (this.description){
            data.description = this.description;
        }
        await API.qosPolicy.post({ policy: data })
        MESSAGE.success(`限速策略 ${this.name} 创建成功`);
        qosPolicyTable.refresh();
        this.hide();
    }
}
export class QosPolicyRules extends Dialog {
    constructor() {
        super();
        this.description = null;
        this.qosPolicy = {};
        this.selected = [];
        this.headers = [
            { text: 'id', value: 'id' },
            { text: 'direction', value: 'direction' },
            { text: 'max_kbps', value: 'max_kbps' },
            { text: 'max_burst_kbps', value: 'max_burst_kbps' },
        ];
        this.extendItems = []
    }
    async deleteSelected(){
        for (let i in this.selected){
            let rule = this.selected[i];
            try {
                await API.qosPolicy.deleteRule(this.qosPolicy.id, rule.id);
                MESSAGE.success(`规则 ${rule.id} 删除成功`);
                this.qosPolicy = (await API.qosPolicy.show(this.qosPolicy.id)).policy;
            } catch (e) {
                MESSAGE.error(`规则 ${rule.id} 删除失败`);
            }
            this.selected = [];
        }
    }
    async open(qosPolicy) {
        this.qosPolicy = qosPolicy;
        super.open();
        this.qosPolicy = (await API.qosPolicy.show(this.qosPolicy.id)).policy;
    }
}
export class NewQosPolicyRule extends Dialog {
    constructor() {
        super();
        this.qosPolicyRulesDialog = {};
        this.directionList = ['ingress', 'egress'];
        this.direction = 'ingress'
        this.maxKbps = null;
        this.maxBurstKbps = null;
    }
    async commit(){
        let data = {direction: this.direction};
        try {
            if (this.maxKbps) { data.max_kbps = parseInt(this.maxKbps); }
            if (this.maxBurstKbps) { data.max_burst_kbps = parseInt(this.maxBurstKbps); }
        } catch {
            ALERT.error(`非法数值`);
            return;
        }
        if (Object.keys(data).length <= 1){
            return;
        }
        let qosPolicy = this.qosPolicyRulesDialog.qosPolicy;
        try {
            await API.qosPolicy.addRule(qosPolicy.id, data);
            MESSAGE.success(`规则创建成功`);
        } catch (e) {
            console.error(e);
            MESSAGE.error(`规则创建失败: ${e}`);
            return;
        }
        this.qosPolicyRulesDialog.qosPolicy = (await API.qosPolicy.show(qosPolicy.id)).policy;
    }
    async open(qosPolicyRulesDialog) {
        this.qosPolicyRulesDialog = qosPolicyRulesDialog;
        super.open();
    }
}
export class NewSGDialog extends Dialog {
    constructor() {
        super();
        this.name = null;
        this.description = null;
    }
    randomName() {
        this.name = Utils.getRandomName('security-group');
    }
    open() {
        this.randomName();
        super.open();
    }
    async commit() {
        if (!this.name) {
            ALERT.error(`请输入安全组名`);
            return;
        }
        let data = {name: this.name};
        if (this.description){ data['description'] = this.description }
        await API.sg.post({ security_group: data });
        MESSAGE.success(`安全组 ${this.name} 创建成功`);
        sgTable.refresh();
        this.hide();
    }
}
export class NewSGRuleDialog extends Dialog {
    constructor() {
        super();
        this.remoteIp = null;
        this.remoteGroup = null;
        this.description = null;
        this.dstPortMin = null;
        this.dstPortMax = null;
        this.direction = 'ingress';
        this.directionList = ['ingress', 'egress'];
        this.ethertype = 'IPv4';
        this.ethertypeList = ['IPv4', 'IPv6'];
        // this.icmpType = null;
        // this.icmpCode = null;
        this.protocol = 'tcp';
        this.protocolList = [
            'tcp', 'ah', 'dccp', 'egp', 'esp', 'gre', 'icmp', 'igmp',
            'ipv6-encap', 'ipv6-frag', 'ipv6-icmp', 'ipv6-nonxt',
            'ipv6-opts', 'ipv6-route', 'ospf', 'pgm', 'rsvp', 'sctp',
            'udp', 'udplite', 'vrrp'
        ]
        // and integer representations [0-255];

    }
    open(sgRulesDialog) {
        this.sgRulesDialog = sgRulesDialog;
        super.open();
    }
    async commit() {
        console.log(this.sgRulesDialog.securityGroup);
        if (! this.sgRulesDialog.securityGroup){
            MESSAGE.error(`规格添加失败`)
            return
        }
        let data = {
            security_group_id: this.sgRulesDialog.securityGroup.id,
            protocol: this.protocol,
            direction: this.direction,
            ethertype: this.ethertype,
        };
        if (this.remoteIp && this.remoteGroup) {
            ALERT.warn(`对端IP和对端安全组不能同时设置`);
            return;
        }
        if (this.remoteIp){ data['remote_ip_prefix'] = this.remoteIp }
        if (this.remoteGroup){ data['remote_group_id'] = this.remoteGroup }
        if (this.dstPortMin){ data['port_range_min'] = this.dstPortMin; }
        if (this.dstPortMax){ data['port_range_max'] = this.dstPortMax; }
        if (this.dstPortMin && this.dstPortMax && this.dstPortMin > this.dstPortMax){
            ALERT.error(`开始端口必须小于结束端口，请输入正确的端口范围。`);
            return;
        }
        await API.sgRule.create(data);
        MESSAGE.success(`规则创建成功`);
        let newSG = (await API.sg.show(this.sgRulesDialog.securityGroup.id)).security_group;
        this.sgRulesDialog.securityGroup = newSG;
        this.hide();
    }
}
export class SGRulesDialog extends Dialog {
    constructor() {
        super()
        this.securityGroup = {};
        this.selected = [];
        this.itemsPerPage = 10;
        this.search = '';
        this.headers = [
            { text: 'direction', value: 'direction' },
            { text: 'protocol', value: 'protocol' },
            { text: 'ethertype', value: 'ethertype' },
            { text: 'port_range', value: 'port_range' },
            { text: 'remote_ip_prefix', value: 'remote_ip_prefix' },
        ];
        this.extendItems = [
            { text: 'id', value: 'id' },
            { text: 'description', value: 'description' },
            { text: 'revision_number', value: 'revision_number' },
            { text: 'tags', value: 'tags' },
            { text: 'created_at', value: 'created_at' },
            
        ]
    }
    async open(securityGroup) {
        this.securityGroup = securityGroup;
        this.selected = [];
        super.open();
        this.securityGroup = await this.getSecurityGroup(this.securityGroup.id);
    }
    async getSecurityGroup(sgId){
        return (await API.sg.show(sgId)).security_group;
    }
    async deleteSelected() {
        for(let i in this.selected){
            let sgRule = this.selected[i];
            await API.sgRule.delete(sgRule.id);
        }
        this.selected = [];
        MESSAGE.success(`规则删除成功`);
        this.securityGroup = await this.getSecurityGroup(this.securityGroup.id);
    }
}

export class ServerTopology extends Dialog {
    constructor() {
        super()
    }
    async drawServerTopoply() {
        var chartDom = document.getElementById('server');
        while (! chartDom){
            await Utils.sleep(0.1);
            chartDom = document.getElementById('server');
        }
        var myChart = echarts.init(chartDom);
        let data = []
        let links = []
        let categories = [{ name: '虚拟机' }, { name: '网络' }, { name: '路由' }];
        let option = {
            tooltip: {},
            legend: [{ data: categories.map((x) => { return x.name }) }],
            series: [{
                type: 'graph', layout: 'force',
                data: data, links: links, categories: categories,
                roam: true, label: { position: 'right' },
                force: { repulsion: 100 }
            }]
        }

        let serverNets = {};

        let servers = serverTable.items;
        for (let i in servers) {
            let server = servers[i];
            data.push({
                id: server.id,
                name: server.name,
                symbolSize: 30,
                category: 0
            });
            myChart.setOption(option);
            for (let netName in server.addresses) {
                let address = server.addresses[netName][0];
                let macAddress = address['OS-EXT-IPS-MAC:mac_addr'];
                let serverPort = (await API.port.list({ mac_address: macAddress })).ports[0];
                if (Object.keys(serverNets).indexOf(serverPort.network_id) < 0) {
                    let net = (await API.network.show(serverPort.network_id)).network;
                    serverNets[net.id] = net;
                    data.push({id: net.id, name: net.name, symbolSize: 20, category: 1})
                }
                links.push({ source: serverPort.network_id, target: server.id })
            }
        }
        let routers = (await API.router.list()).routers;
        for (let i in routers){
            let router = routers[i];
            data.push({id: router.id, name: router.name, symbolSize: 35, category: 2,  })
            let netIds = await this.getRouterNets(router.id, serverNets);
            netIds.forEach((netId) => {
                links.push({ source: router.id, target: netId })
            })
        }
        myChart.setOption(option);
    }
    async getRouterNets(routerId, serverNets){
        let netIds = []
        let routerPorts = await API.router.listInterface(routerId)
        routerPorts.forEach((port) => {
            let subnetId = port.fixed_ips[0].subnet_id;
            for(let netId in serverNets){
                if (serverNets[netId].subnets[0] == subnetId){
                    netIds.push(netId)
                    break
                }
            }
        })
        return netIds
    }
    open() {
        super.open();
        this.drawServerTopoply();
    }
}
export class ServerActionsDialog extends Dialog {
    constructor() {
        super();
        this.server = {};
        this.actions = [];
    }
    async open(server) {
        this.server = server;
        this.actions = [];
        super.open();
        this.actions = (await API.server.actionList(this.server.id)).reverse();
    }
    getStartTime(startTime){
        if (! startTime){
            return ''
        }
        return Utils.parseUTCToLocal(startTime);
    }
    isActionError(action){
        if (action.message && action.message.toLowerCase().includes('error')){
            return true;
        }
        else {
            return false;
        }
    }
    async getserverAction(reqId){
        let action = (await API.server.actionShow(this.server.id, reqId));
        console.log(action.events);
    }
}
export class ServerActionEventsDialog extends Dialog {
    constructor() {
        super();
        this.server = {};
        this.requestId = null;
        this.instanceAction = {};
    }
    async open(server, requestId) {
        this.server = server;
        this.requestId = requestId;
        super.open();
        this.instanceAction = await API.server.actionShow(this.server.id, this.requestId);
    }
    getStartTime(startTime){
        return Utils.parseUTCToLocal(startTime);
    }
    isEventError(event){
        if (event.result && event.result.toLowerCase().includes('error')){
            return true;
        }
        else {
            return false;
        }
    }
}
export class ServerConsoleLogDialog extends Dialog {
    constructor() {
        super();
        this.server = {};
        this.length = 10;
        this.content = '';
        this.refreshing = false;
    }
    async open(server) {
        this.server = server;
        super.open();
        this.refreshConsoleLog(this.length);
    }
    async refreshConsoleLog(length){
        if (this.server['OS-EXT-SRV-ATTR:host'] == null) {
            ALERT.error(`虚拟机 ${this.server.name || this.server.id} 未创建`);
            return
        }
        this.refreshing = true;
        try {
            this.content = (await API.server.getConsoleLog(this.server.id, length));
        } catch (e) {
            MESSAGE.error(`获取日志失败!`);
            console.error(e)
        }
        this.refreshing = false;
    }
    async more() {
        if (this.length == null) {
            this.length = 10;
        }
        let length = this.length + 10;
        await this.refreshConsoleLog(length);
        this.length = length;
    }
    async all() {
        await this.refreshConsoleLog(null);
        this.length = null;
    }
}
export class ImageDeleteSmartDialog extends Dialog {
    constructor(){
        super();
        this.smart = false;
    }

    async resetBackupState(backupId){
        let deletableStatus = ['error', 'available'];
        let backup = (await API.backup.show(backupId)).backup
        if (deletableStatus.indexOf(backup.status) >= 0){
            return true;
        }
        for (let i = 0; i < 10; i++){
            await API.backup.resetState(backupId, 'error');
            Utils.sleep(3)
            backup = (await API.backup.show(backupId)).backup
            if (backup.status == 'error'){
                return true;
            }
        }
        return false;
    }

    async deleteInstanceBackup(image){
        if (image.block_device_mapping && image.block_device_mapping.length > 0) {
            let bdm = JSON.parse(image.block_device_mapping)[0];
            console.log(bdm)
            let backupId = bdm.backup_id;
            let resetSuccess = (await this.resetBackupState(backupId))
            if (resetSuccess) {
                await API.image.delete(image.id);
                await imageTable.waitDeleted(image.id);
                imageTable.refresh();
            } else {
                MESSAGE.error(`删除镜像 ${image.id} 失败 `)
            }
        } else {
            console.warn(`image ${image.id} is instance backup, but bdm is null`)
        }
    }
    async deleteSnapshot(image) {
        await this.deleteInstanceBackup(image);
    }

    async commit(){
        if (! this.smart) {
            await imageTable.deleteSelected();
            this.hide();
            return;
        } else {
            for (let i in imageTable.selected){
                let item = imageTable.selected[i];
                if (!item.image_type) {
                    await API.image.delete(item.id);
                    await imageTable.waitDeleted(item.id);
                    imageTable.refresh();
                    continue;
                }
                if (item.image_type == 'instance_backup'){
                    await this.deleteInstanceBackup(item);
                    await imageTable.waitDeleted(item.id);
                } else if (item.image_type == 'snapshot') {
                    await this.deleteSnapshot(item);
                    await imageTable.waitDeleted(item.id);
                } else {
                    console.warn(`TODO: image type ${item.image_type} is not supported.`)
                }
            }
        }
        this.hide();
        imageTable.resetSelected();
    }
}
export class ImagePropertiesDialog extends Dialog {
    constructor(){
        super();
        this.image = {};
        this.properties = {};
        this.propertyContent = null;
    }
    async open(image) {
        this.image = image;
        let imageData = await API.image.show(this.image.id)
        this.properties = {};
        for (let key in imageData) {
            if (key.startsWith('hw_')) {
                this.properties[key] = imageData[key];
            }
        }
        super.open();
    }
    async removeProperty(key){
        await API.image.removeProperties(this.image.id, [key]);
        Vue.delete(this.properties, key);
    }
    async addProperties(){
        console.log(this.propertyContent)
        if (! this.propertyContent){
            return;
        }
        let propertyLines = this.propertyContent.split('\n');
        let properties = {};
        for (var i = 0; i < propertyLines.length; i++) {
            let line = propertyLines[i];
            if (line.trim() == '') { continue; }
            let kv = line.split('=');
            if (kv.length != 2) {
                ALERT.error(`输入内容有误: ${line}`)
                return;
            }
            let key = kv[0].trim();
            let value = kv[1].trim();
            if (key == '' || ! key.startsWith('hw_') || value == '') {
                ALERT.error(`输入内容有误: ${line}`)
                return;
            }
            properties[key] = value;
        }

        await API.image.addProperties(this.image.id, properties)
        MESSAGE.success(`属性添加成功`);
        for (let key in properties) {
            Vue.set(this.properties, key, properties[key])
        }
    }
}
export class NewImageDialog extends Dialog {
    constructor(){
        super();
        this.name = null;
        this.diskFormat = 'qcow2';
        this.containerFormat = 'bare';

        this.architecture = null;
        this.protected = false;
        this.minDisk = null;
        this.visibility = null;
        this.kernelId = null;
        this.tags = null;
        this.osVersion = null;
        this.osDistro = null;
        this.id = null;
        this.owner = null;
        this.ramdiskID = null;
        this.minRam = null;
        this.property = null;

        this.diskFormats = ['None', 'ami', 'ari', 'aki', 'vhd', 'vhdx', 'vmdk', 'raw', 'qcow2', 'vdi', 'iso', 'ploop'];
        this.visibilities = ['public', 'private', 'community', 'shared'];
        this.containerFormats = ['None', 'ami', 'ari', 'aki', 'bare', 'ovf', 'ova', 'docker'];

        this.file = null;
        this.process = '0';
    }
    randomName() {
        this.name = Utils.getRandomName('image');
    }
    async open() {
        this.randomName();
        this.process = '0';
        this.file = null;
        super.open();
    }
    async readImage(file) {
        return new Promise(function(resolve, reject) {
            let reader = new FileReader();
            reader.onloadend = function() {
                if (reader.error){
                    MESSAGE.error('文件读取失败');
                    reject()
                } else {
                    resolve(reader)
                }
            }
            reader.readAsArrayBuffer(file);
        });
    }
    setName(){
        if (this.file) {
            let fileNameList = this.file.name.split('.');
            let extName = fileNameList.slice(-1)[0]
            this.name = fileNameList.slice(0, -1).join('.');
            if (this.diskFormats.indexOf(extName) >= 0){
                this.diskFormat = extName;
            }
        }
    }
    async upload(id) {
        let self = this;
        MESSAGE.info('开始上传镜像...')
        let reader = await this.readImage(this.file);
        await API.image.uploadSlice(
            id, reader.result, this.file.size,
            (loaded, total) => { self.process = (loaded * 100 / total).toFixed(3);}
        )
        MESSAGE.success('镜像缓存成功，等待上传。')
        imageTable.refresh();
        self.hide();
    }
    async commit(){
        if (!this.name) { ALERT.error(`请输入镜像名`); return ;}
        let data = {name: this.name, disk_format: this.diskFormat, container_format: this.containerFormat};
        if (this.visibility) {data.visibility = this.visibility};
        
        let image = await API.image.post(data);
        MESSAGE.success(`镜像创建成功`)
        
        if (this.file) {
            await this.upload(image.id);
        }
    }
}

export class TasksDialog extends Dialog {
    constructor(){
        super();
        this.tasks = {
            'uploading': []
        };
        this.interval = null;
    }
    async refresh(){
        this.tasks = (await API.task.list()).tasks;
    }
    async delete(task_id) {
        try {
            await API.task.delete(task_id);
            this.refresh();
        } catch {
            MESSAGE.error(`删除失败`)
        }
    }
    async open() {
        let self = this;

        this.refresh();
        super.open()

        if (!this.interval){
            this.interval = setInterval(() => {
                self.refresh()
            }, 3000);
        }
    }
    stopInterval(){
        if (this.interval){
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}

export default Dialog;
