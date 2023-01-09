import API from './api.js'
import { AggHostsDialog, NewAggDialog, NewDomainDialog, NewImageDialog, NewProjectDialog, ServerResetStateDialog, TasksDialog, TenantUsageDialog } from './dialogs.js';
import { ALERT, LOG, MESSAGE, ServerTasks, Utils } from './lib.js'
import { netTable } from './objects.js';


class DataTable {
    constructor(headers, api, bodyKey = null, name = '') {
        this.headers = headers;
        this.api = api;
        this.bodyKey = bodyKey;
        this.name = name;
        this.itemsPerPage = 10;
        this.search = '';
        this.items = [];
        this.statistics = {};
        this.selected = []
        this.extendItems = []
        this.newItemDialog = null;
    }
    async openNewItemDialog(){
        if (this.newItemDialog){
            this.newItemDialog.open();
        }
    }
    async createNewItem(){
        if (this.newItemDialog) {
            await this.newItemDialog.commit();
            this.refresh();
        }
    }
    async deleteSelected() {
        if (this.selected.length == 0) {
            return;
        }
        MESSAGE.info(`${this.name} 删除中`)
        for (let i in this.selected) {
            let item = this.selected[i];
            try {
                await this.api.delete(item.id || item.name);
                this.waitDeleted(item.id || item.name);
            } catch {
                MESSAGE.error(`删除 ${this.name} ${item.id} 失败`)
            }
        }
        this.refresh();
        this.resetSelected();
    }
    async waitDeleted(id) {
        while (true) {
            let body = await this.api.list({ id: id })
            if (body[this.bodyKey].length == 0) {
                MESSAGE.success(`${this.name} ${id} 删除成功`, 2);
                this.refresh();
                break;
            }
            await Utils.sleep(5);
        }
    }
    resetSelected() {
        this.selected = [];
    }
    updateItem(newItem) {
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].id != newItem.id) {
                continue;
            }
            for (var key in newItem) {
                this.items[i][key] = newItem[key];
            }
            break
        }
    }
    async refresh(filters = {}) {
        let result = null
        if (this.api.detail) {
            result = await this.api.detail(filters);
        } else {
            result = await this.api.list(filters)
        }
        this.items = this.bodyKey ? result[this.bodyKey] : resp;
        return result;
    };
}


export class RouterDataTable extends DataTable {
    constructor() {
        super([
            { text: 'id', value: 'id' },
            { text: 'name', value: 'name' },
            { text: 'status', value: 'status' },
            { text: 'admin_state_up', value: 'admin_state_up' },
            { text: 'revision_number', value: 'revision_number' },
            { text: 'routes', value: 'routes' },
        ], API.router, 'routers');
        this.extendItems = [
            { text: 'description', value: 'description' },
            { text: 'created_at', value: 'created_at' },
            { text: 'project_id', value: 'project_id' },
            { text: 'tags', value: 'tags' },
            { text: 'external_gateway_info', value: 'external_gateway_info' },
        ];
    }
    adminStateDown(item) {
        API.router.put(item.id, { router: { admin_state_up: item.admin_state_up } }).then(resp => {
            if (item.admin_state_up) {
                MESSAGE.success(`路由 ${item.name} 已设置为 UP`)
            } else {
                MESSAGE.success(`路由 ${item.name} 已设置为 DOWN`)
            }
        })
    }
}

export class NetDataTable extends DataTable {
    constructor() {
        super([
            { text: 'ID', value: 'id' },
            { text: '名字', value: 'name' },
            { text: '状态', value: 'status' },
            { text: 'admin_state_up', value: 'admin_state_up' },
            { text: '共享', value: 'shared' },
            { text: '网络类型', value: 'provider:network_type' },
            { text: 'MTU', value: 'mtu' },
            { text: '子网', value: 'subnets' },
        ], API.network, 'networks', '网络');
        this.extendItems = [
            { text: 'description', value: 'description' },
            { text: 'created_at', value: 'created_at' },
            { text: 'project_id', value: 'project_id' },
            { text: 'qos_policy_id', value: 'qos_policy_id' },
            { text: 'port_security_enabled', value: 'port_security_enabled' },
            { text: 'ipv4_address_scope', value: 'ipv4_address_scope' },
            { text: 'provider:physical_network', value: 'provider:physical_network' },
            { text: 'provider:segmentation_id', value: 'provider:segmentation_id' },
            { text: 'ipv4_address_scope', value: 'ipv4_address_scope' },
            { text: 'ipv6_address_scope', value: 'ipv6_address_scope' },
            { text: 'dns_domain', value: 'dns_domain' },
            { text: 'vlan_transparent', value: 'vlan_transparent' },
        ];
        this.subnets = {};
    }
    async refreshSubnets() {
        let body = await API.subnet.list();
        body.subnets.forEach(item => {
            Vue.set(this.subnets, item.id, item)
        });
    }
    async deleteSubnet(subnet_id) {
        let subnet = this.subnets[subnet_id];
        try {
            await API.subnet.delete(subnet_id)
        } catch(error) {
            MESSAGE.error(`子网 ${subnet.cidr} 删除失败， ${error.response.data.NeutronError.message}`)
            return;
        }
        MESSAGE.success(`子网 ${subnet.cidr} 删除成功`)
        netTable.refresh();
    }
    async adminStateDown(item) {
        await API.network.put(item.id, { network: { admin_state_up: item.admin_state_up } })
        if (item.admin_state_up) {
            MESSAGE.success(`网络 ${item.name} 已设置为 UP`)
        } else {
            MESSAGE.success(`网络 ${item.name} 已设置为 down`)
        }
    }
    async shared(item) {
        await API.network.put(item.id, { network: { shared: item.shared } })
        if (item.shared) {
            MESSAGE.success(`网络 ${item.name} 已设置为共享`)
        } else {
            MESSAGE.success(`网络 ${item.name} 已取消共享`)
        }
    }
}
export class PortDataTable extends DataTable {
    constructor() {
        super([
                { text: 'ID', value: 'id' },
                { text: 'Name', value: 'name' },
                { text: 'vnic_type', value: 'binding:vnic_type' },
                { text: 'vif_type', value: 'binding:vif_type' },
                { text: 'status', value: 'status' },
                { text: 'admin_state_up', value: 'admin_state_up' },
                { text: 'device_owner', value: 'device_owner' },
                { text: 'fixed_ips', value: 'fixed_ips' },
                { text: '操作', value: 'actions' },
        ], API.port, 'ports');

        this.extendItems = [
            { text: 'binding:vif_details', value: 'binding:vif_details' },
            { text: 'binding:profile', value: 'binding:profile' },
            { text: 'binding:host_id', value: 'binding:host_id' },
            { text: 'network_id', value: 'network_id' },
            { text: 'device_id', value: 'device_id' },
            { text: 'security_groups', value: 'security_groups' },
            { text: 'mac_address', value: 'mac_address' },
            { text: 'qos_policy_id', value: 'qos_policy_id' },
            { text: 'description', value: 'description' },

        ];
    }
    adminStateDown(item) {
        API.port.put(item.id, { port: { admin_state_up: item.admin_state_up } }).then(resp => {
            if (item.admin_state_up) {
                MESSAGE.success(`端口 ${item.name || item.id} 已设置为 UP`)
            } else {
                MESSAGE.success(`端口 ${item.name || item.id} 已设置为 DOWN`)
            }
        }).catch(error => {
            MESSAGE.error(`端口 ${item.name} 更新失败`)
            item.admin_state_up = !item.admin_state_up;
        })
    }
}
export class SecurityGroupDataTable extends DataTable {
    constructor() {
        super([
            { text: 'id', value: 'id' },
            { text: '名字', value: 'name' },
            { text: 'revision_number', value: 'revision_number' },
            { text: '租户ID', value: 'tenant_id' },
            { text: '操作', value: 'actions' },
        ], API.sg, 'security_groups');
        this.extendItems = [
            { text: 'description', value: 'description' },
            { text: 'created_at', value: 'created_at' },
            { text: 'updated_at', value: 'updated_at' },
            
        ];
    }
}
export class QosPolicyDataTable extends DataTable {
    constructor() {
        super([
                { text: 'id', value: 'id' },
                { text: '名字', value: 'name' },
                { text: '标签', value: 'tags' },
                { text: 'revision_number', value: 'revision_number' },
                { text: '是否默认', value: 'is_default' },
                { text: '是否共享', value: 'shared' },
                { text: '操作', value: 'actions' },
        ], API.qosPolicy, 'policies');
        this.extendItems = [
            { text: 'rules', value: 'rules' },
            { text: 'created_at', value: 'created_at' },
            { text: 'updated_at', value: 'updated_at' },
            { text: 'description', value: 'description' },
        ];
    }
    async updateDefault(item){
        let data = {is_default: item.is_default}
        await API.qosPolicy.put(item.id, {policy: data});
        MESSAGE.success(`限速规则 ${item.name || item.id } 更新成功`)
    }
    async updateShared(item){
        let data = {shared: item.shared}
        await API.qosPolicy.put(item.id, {policy: data});
        MESSAGE.success(`限速规则 ${item.name || item.id } 更新成功`)
    }
}
export class FlavorDataTable extends DataTable {
    constructor() {
        super([{ text: 'ID', value: 'id' },
        { text: '名字', value: 'name' },
        { text: '内存', value: 'ram' },
        { text: 'vcpu', value: 'vcpus' },
        { text: '磁盘', value: 'disk' },
        { text: 'swap', value: 'swap' },
        { text: 'ephemeral', value: 'OS-FLV-EXT-DATA:ephemeral' },
        ], API.flavor, 'flavors');
        this.extraSpecsMap = {};
        this.isPublic = true;
    }
    waitDeleted(id) {}
    async deleteSelected() {
        if (this.selected.length == 0) {
            return;
        }
        for (let i in this.selected) {
            let item = this.selected[i];
            await this.api.delete(item.id);
            MESSAGE.success(`规格 ${item.id} 删除成功`);
        }
        this.refresh();
        this.resetSelected();
    }
    async refreshExtraSpecs() {
        for (let i in this.items) {
            let item = this.items[i];
            let body = await API.flavor.getExtraSpecs(item.id);
            Vue.set(this.extraSpecsMap, item.id, body.extra_specs);
        }
    }
    async refresh() {
        await super.refresh({ is_public: this.isPublic })
        this.refreshExtraSpecs()
    }
}
export class KeypairDataTable extends DataTable {
    constructor() {
        super([{ text: '名字', value: 'name' },
        { text: '类型', value: 'type' },
        { text: '密钥指纹', value: 'fingerprint' }
        ], API.keypair, 'keypairs', '密钥对');
        // this.extendItems = [
        //     { text: '公钥', value: 'public_key' },
        // ]
    }
    copyPublicKey(item) {
        Utils.copyToClipboard(item.public_key)
        MESSAGE.success(`公钥内容已复制`);
    }
    waitDeleted(id) {
        MESSAGE.success(`${name} ${id} 删除成功`, 1)
        return
    }
    async refresh(filters = {}) {
        let body = null
        if (this.api.detail) {
            body = await this.api.detail(filters);
        } else {
            body = await this.api.list(filters)
        }
        this.items = [];
        body.keypairs.forEach(item => {
            this.items.push(item.keypair);
        })
        return body
    };

}

export class ServerDataTable extends DataTable {
    constructor() {
        super([{ text: '实例名字', value: 'name' },
                { text: '宿主机', value: 'OS-EXT-SRV-ATTR:host' },
                { text: '规格', value: 'flavor' },
                { text: '镜像', value: 'image' },
                { text: 'IP地址', value: 'addresses' },
                { text: '状态/任务', value: 'status' },
                { text: '电源状态', value: 'power_state' },
                { text: '操作', value: 'action' },
              ], API.server, 'servers', '实例');
        this.imageMap = {}
        this.errorMessage = {};
        this.resetStateDialog = new ServerResetStateDialog();
    }
    getSelectedServerHosts(){
        let serverHosts = []
        for (let i in this.selected) {
            if (!this.selected[i]['OS-EXT-SRV-ATTR:host']){
                continue;
            }
            serverHosts.push(this.selected[i]['OS-EXT-SRV-ATTR:host'])
        }
        return serverHosts;
    }
    async getAvailableMoveHosts(){
        let hosts = [];
        let services = await API.computeService.getComputeServices();
        let serverHosts = this.getSelectedServerHosts();
        for (let i in services){
            if (serverHosts.indexOf(services[i].host) >= 0 || services[i].state != 'up'){
                continue
            }
            hosts.push(services[i].host);
        }
        return hosts

    }
    openResetStateDialog(){
        this.resetStateDialog.open(this);
    }

    async recheckSavedTasks(clusterId, region){
        let serverTasks = new ServerTasks();
        for (let serverId in serverTasks.getAll()){
            let servers = (await API.server.list({uuid: serverId})).servers;
            if (! servers || servers.length == 0 ){
                serverTasks.delete(serverId)
                continue;
            }
            console.log('waitServerStatus ' + serverId)
            this.waitServerStatus(serverId).then(resp => {
                serverTasks.delete(serverId);
            });
        }
    }
    async waitServerMoved(server) {
        let srcHost = server['OS-EXT-SRV-ATTR:host'];
        let serverUpdated = {};
        while (true) {
            let body = await API.server.get(server.id);
            serverUpdated = body.server;
            this.updateItem(serverUpdated);
            if (! serverUpdated['OS-EXT-STS:task_state']) {
                if (serverUpdated['OS-EXT-SRV-ATTR:host'] != srcHost) {
                    return;
                } else {
                    throw Error(`疏散失败`);
                }
            }
            await Utils.sleep(5)
        }
    }
    async waitServerStatus(server_id, expectStatus = ['ACTIVE', 'ERROR']) {
        let expectStatusList = []
        if (typeof expectStatus == 'string') {
            expectStatusList.push(expectStatus.toUpperCase())
        } else {
            expectStatus.forEach(item => {
                expectStatusList.push(item.toUpperCase())
            })
        }
        let currentServer = {};
        let oldTaskState = ''
        while (true) {
            let body = await API.server.get(server_id);
            currentServer = body.server;
            if (currentServer['OS-EXT-STS:task_state'] != oldTaskState) {
                this.updateItem(currentServer);
                oldTaskState = currentServer['OS-EXT-STS:task_state'];
            }
            LOG.debug(`wait server ${server_id} to be ${expectStatusList}, now: ${currentServer.status.toUpperCase()}`)
            if (expectStatusList.indexOf(currentServer.status.toUpperCase()) >= 0) {
                this.updateItem(currentServer);
                break
            }
            await Utils.sleep(5)
        }
        return currentServer
    }
    async waitServerTaskCompleted(server_id, taskState) {
        let expectStateList = typeof taskState == 'string'? [taskState] : taskState
        let currentServer = {};
        let oldTaskState = ''
        while (true) {
            let body = await API.server.get(server_id);
            currentServer = body.server;
            if (expectStateList.indexOf(currentServer['OS-EXT-STS:task_state']) < 0) {
                break
            }
            if (currentServer['OS-EXT-STS:task_state'] != oldTaskState) {
                this.updateItem(currentServer);
            }
            console.debug(`wait server ${server_id} task state to be ${expectStateList}, now: ${currentServer['OS-EXT-STS:task_state']}`);
            await Utils.sleep(5)
        }
        return currentServer
    }
    async stopSelected() {
        let self = this;
        for (let i in this.selected) {
            let item = this.selected[i];
            if (item.status.toUpperCase() != 'ACTIVE') {
                ALERT.warn(`虚拟机 ${item.name} 不是运行状态`)
                continue;
            }
            self.api.stop(item.id);
            self.waitServerStatus(item.id, 'SHUTOFF').then(() => {
                MESSAGE.success(`虚拟机 ${item.name}已关机`);
            });
        }
    }
    async startSelected() {
        let self = this;
        for (let i in this.selected) {
            let item = this.selected[i];
            if (item.status.toUpperCase() != 'SHUTOFF') {
                ALERT.warn(`虚拟机 ${item.name} 不是关机状态`)
                continue;
            }
            await self.api.start(item.id)
            self.waitServerStatus(item.id, 'ACTIVE').then(() => {
                MESSAGE.success(`虚拟机 ${item.name}已开机`);
            });
        };
    }
    async pauseSelected() {
        let self = this;
        for (let i in this.selected) {
            let item = this.selected[i];
            if (item.status.toUpperCase() != 'ACTIVE') {
                ALERT.warn(`虚拟机 ${item.name} 不是运行状态`)
                continue;
            }
            await self.api.pause(item.id);
            self.waitServerStatus(item.id, 'PAUSED').then(() => {
                MESSAGE.success(`虚拟机 ${item.name}已暂停`)
            });
        };
    }
    async unpauseSelected() {
        let self = this;
        for (let i in this.selected) {
            let item = this.selected[i];
            if (item.status.toUpperCase() != 'PAUSED') {
                ALERT.warn(`虚拟机 ${item.name} 不是暂停状态`)
                continue;
            }
            await self.api.unpause(item.id);
            self.waitServerStatus(item.id, 'ACTIVE').then(() => {
                MESSAGE.success(`虚拟机 ${item.name}已开启`);
            });
        };
    }
    async rebootSelected(type = 'SOFT') {
        for (let i in this.selected) {
            let item = this.selected[i];
            if (type == 'SOFT' && item.status.toUpperCase() != 'ACTIVE') {
                ALERT.warn(`虚拟机 ${item.name} 不是运行状态`, 1)
                continue;
            }
            await this.api.reboot(item.id, type)
            this.waitServerStatus(item.id, 'ACTIVE').then(() => {
                MESSAGE.success(`虚拟机 ${item.name}已重启`)
            });
        };
        this.refresh();
        this.resetSelected();
    }

    getImage(server) {
        let self = this;
        let imageId = server.image.id;
        if (!imageId) {
            return {}
        } else if (Object.keys(this.imageMap).indexOf(imageId) < 0) {
            Vue.set(this.imageMap, imageId, {})
            API.image.get(imageId).then(body => {
                LOG.debug(`get image info for ${imageId} success`)
                self.imageMap[imageId] = body;
            });
            return this.imageMap[imageId];
        } else {
            return this.imageMap[imageId];
        }
    }
    getErrorMesage(server){
        if (server.fault && server.fault.message) {
            return server.fault.message;
        }
        API.server.show(server.id).then(resp => {
            Vue.set(this.errorMessage, server.id, resp.server.fault && resp.server.fault.message);
        });
        return this.errorMessage[server.id];
    }
    parseAddresses(server){
        let addressMap = {};
        for (let netName in server.addresses){
            for (let i in server.addresses[netName]){
                let address = server.addresses[netName][i]
                if (Object.keys(addressMap).indexOf(address['OS-EXT-IPS-MAC:mac_addr']) < 0){
                    addressMap[address['OS-EXT-IPS-MAC:mac_addr']] = []
                }
                addressMap[address['OS-EXT-IPS-MAC:mac_addr']].push(address.addr)
            }
        }
        return Object.values(addressMap);
    }
}
export class ServiceTable extends DataTable {
    constructor() {
        super([{ text: '服务', value: 'binary' },
        { text: '主机', value: 'host' },
        { text: 'zone', value: 'zone' },
        { text: '服务状态', value: 'state' },
        { text: '启用', value: 'status' },
        { text: '强制down', value: 'forced_down' },
        { text: '更新时间', value: 'updated_at' },
        ], API.computeService, 'services')
    }
    async waitDeleted(id) {
        MESSAGE.success(`${this.name} ${id} 删除成功`, 2);
    }
    async forceDown(service) {
        let down = service.forced_down;
        try {
            await API.computeService.forceDown(service.id, down)
            if (down) {
                MESSAGE.success(`${service.host}:${service.binary} 已强制设为 Down`)
            } else {
                MESSAGE.success(`${service.host}:${service.binary} 已取消强制 Down`)
            }
        } catch (error) {
            MESSAGE.error(`${service.host}:${service.binary} 设置强制down失败`)
            service.forced_down = !down;
            return;
        }
        this.refresh();
    }
    enable(service) {
        let status = service.status;
        if (status == 'enabled') {
            service.status = 'disabled';
            API.computeService.disable(service.id).then(resp => {
                MESSAGE.success(`${service.host}:${service.binary} 已设置为不可用`)
            }).catch(error => {
                MESSAGE.error(`${service.host}:${service.binary} 设置不可用失败`)
                service.status = 'enabled';
            });
        } else {
            service.status = 'enabled';
            API.computeService.enable(service.id).then(resp => {
                MESSAGE.success(`${service.host}:${service.binary} 已设置为可用`)
            }).catch(error => {
                MESSAGE.error(`${service.host}:${service.binary} 设置可用失败`)
                service.status = 'enabled';
            });
        }
    }
}

export class UsageTable extends DataTable {
    constructor() {
        super([{ text: '租户ID', value: 'tenant_id' },
        { text: '总内存使用', value: 'total_memory_mb_usage' },
        { text: '总cpu使用', value: 'total_vcpus_usage' },
            //    { text: '实例使用', value: 'server_usages' },
        ], API.usage, 'tenant_usages', 'Usage');
        this.start = '';
        this.end = ''
    }
    refresh() {
        // console.log(this.start, this.end)
        let params = { detailed: 1 };
        if (this.start != this.end) {
            if (this.start) {
                params.start = `${this.start}T00:00:00.0`;
            }
            if (this.end) {
                params.end = `${this.end}T00:00:00.0`;
            }
        }
        // super.refresh({start: this.start, end: this.end})
        super.refresh(params);
    }
}
export class VolumeDataTable extends DataTable {
    constructor() {
        super([{ text: '名字/ID', value: 'name' },
        { text: '状态', value: 'status' },
        { text: '大小', value: 'size' },
        { text: '可启动', value: 'bootable' },
        { text: '卷类型', value: 'volume_type' },
        { text: '镜像名', value: 'image_name' },
        { text: 'multiattach', value: 'multiattach' },
        ], API.volume, 'volumes', '卷')
    }
}

export class VolumeTypeTable extends DataTable {
    constructor() {
        super([{ text: '名字', value: 'name' },
        { text: '是否公共', value: 'is_public' },
        { text: '属性', value: 'extra_specs' },
        ], API.volumeType, 'volume_types');
        this.extendItems = [
            { text: 'id', value: 'id' },
            { text: 'qos_specs_id', value: 'qos_specs_id' },
            { text: 'os-volume-type-access:is_public', value: 'avaios-volume-type-access:is_publiclability_zone' },
            { text: 'description', value: 'description' },
        ];
    }
}

export class SnapshotTable extends DataTable {
    constructor() {
        super([{ text: '名字', value: 'name' },
        { text: '状态', value: 'status' },
        { text: '大小', value: 'size' },
        { text: '卷ID', value: 'volume_id' },
        ], API.snapshot, 'snapshots', '快照')
    }
    async waitSnapshotCreated(snapshot_id) {
        let snapshot = {};
        let expectStatus = ['available', 'error'];
        let oldStatus = ''
        while (true) {
            snapshot = (await API.snapshot.get(snapshot_id)).snapshot;
            LOG.debug(`wait snapshot ${snapshot_id} status to be ${expectStatus}, now: ${snapshot.status}`)
            if (snapshot.status != oldStatus) {
                this.refresh();
            }
            if (expectStatus.indexOf(snapshot.status) >= 0) {
                break;
            }
            oldStatus = snapshot.status;
            await Utils.sleep(3);
        }
        return snapshot
    }
}
export class BackupTable extends DataTable {
    constructor() {
        super([{ text: '名字', value: 'name' },
        { text: '状态', value: 'status' },
        { text: '大小', value: 'size' },
        { text: '卷ID', value: 'volume_id' },
        ], API.backup, 'backups', '备份');
        this.extendItems = [
            { text: 'id', value: 'id' },
            { text: 'fail_reason', value: 'fail_reason' },
            { text: 'snapshot_id', value: 'metadata' },
            { text: 'has_dependent_backups', value: 'has_dependent_backups' },
            { text: 'created_at', value: 'created_at' },
            { text: 'availability_zone', value: 'availability_zone' },
            { text: 'description', value: 'description' },
        ];
    }

    async waitDeleted(backupId) {
        await this.waitBackupDeleted(backupId)
    }
    async waitBackupCreated(backupId) {
        let backup = {};
        let expectStatus = ['available', 'error'];
        let oldStatus = ''
        while (true) {
            backup = (await API.backup.get(backupId)).backup;
            LOG.debug(`wait backup ${backupId} status to be ${expectStatus}, now: ${backup.status}`)
            if (backup.status != oldStatus) {
                this.refresh();
            }
            if (expectStatus.indexOf(backup.status) >= 0) {
                break;
            }
            oldStatus = backup.status;
            await Utils.sleep(3);
        }
        return backup
    }
    async waitBackupDeleted(backupId) {
        let backup = {};
        while (true) {
            try {
                LOG.debug(`wait backup ${backupId} to be deleted`)
                backup = (await API.backup.get(backupId)).backup;
                if (backup.status == 'error') {
                    MESSAGE.error(`备份 ${backupId} 删除失败`);
                    break;
                }
            } catch (error) {
                console.log(error);
                MESSAGE.success(`备份 ${backupId} 删除成功`);
                break
            }
            await Utils.sleep(3);
        }
        this.refresh();
        return backup
    }
    async waitBackupStatus(backupId, status){
        let backup = {};
        while (true) {
            try {
                LOG.debug(`wait backup ${backupId} status to be ${status}`)
                backup = (await API.backup.get(backupId)).backup;
                if (backup.status == status) {
                    break;
                }
            } catch (error) {
                console.error(error);
                break
            }
            await Utils.sleep(3);
        }
        this.refresh();
        return backup
    }
    async resetState(backupId){
        console.info('TODO resetState')
        // API.backup.resetState(backupId, status =)
    }
}
export class VolumeServiceTable extends DataTable {
    constructor() {
        super([
            { text: '服务', value: 'binary' },
            { text: '可用状态', value: 'status' },
            { text: '服务状态', value: 'state' },
            { text: '节点', value: 'host' },
            { text: '更新时间', value: 'updated_at' },
        ], API.volumeService, 'services', '卷服务');
        this.extendItems = [
            { text: 'disabled_reason', value: 'disabled_reason' },
            { text: 'disabled_policy', value: 'disabled_policy' },
            { text: 'zone', value: 'zone' },
        ];
    }
    itemKey() {
        return this.index;
    }
    async refresh(){
        await super.refresh();
        // NOTE: For volume services, no id in items, so add id to make
        // v-data-table item-key works.
        let index = 0;
        for (let i in this.items) {
            this.items[i].id = index ++;
        }
    }
    async toggleEnabled(item) {
        let body = null;
        switch (item.status) {
            case 'enabled':
                body = await API.volumeService.disable(item.binary, item.host);
                if (body.status == 'disabled') {
                    MESSAGE.success(`${this.name} ${item.binary}:${item.host} 已设为不可用`)
                    this.refresh();
                } else {
                    item.status == 'enabled'
                }
                break;
            case 'disabled':
                body = await API.volumeService.enable(item.binary, item.host);
                if (body.status == 'enabled') {
                    MESSAGE.success(`${this.name} ${item.binary}:${item.host} 已设为可用`)
                    this.refresh();
                } else {
                    item.status == 'diabled'
                }
                break;
        }
    }
}
export class ClusterTable extends DataTable {
    constructor() {
        super([], API.cluster, 'clusters', '集群');
        this.selected = null;
        this.regions = [
            'default', 'RegionOne', 'Suzhou', 'Wuxi'
        ]
        this.region = ''
    }
    delete(item) {
        API.cluster.delete(item.id).then(resp => {
            MESSAGE.success(`集群 ${item.name} 删除成功`);
            this.refresh();
        }).catch(error => {
            MESSAGE.error(`集群 ${item.name} 删除失败`);
        })
    }
    getSelectedCluster(){
        if (! this.selected){
            return;
        }
        for(let i in this.items){
            if (this.items[i].name == this.selected){
                return this.items[i]
            }
        }
    }
    setSelected(clusterId){
        for(let i in this.items){
            let cluster = this.items[i];
            if (cluster.id == clusterId){
                this.selected = cluster.name
                break
            }
        }
    }
}
export class RegionTable extends DataTable {
    constructor() {
        super([], API.region, 'regions', '地区');
        this.selected = []
    }
    setSelected(region){
        if (region){
            this.selected = region
        }
    }
}
export class UserTable extends DataTable {
    constructor() {
        super([
            { text: 'name', value: 'name' },
            { text: 'domain_id', value: 'domain_id' },
            { text: 'enabled', value: 'enabled' },
        ], API.user, 'users', '用户');
    }
}
export class DomainTable extends DataTable {
    constructor() {
        super([
            { text: 'ID', value: 'id' },
            { text: '名字', value: 'name' },
            { text: '启用', value: 'enabled' },
            { text: '描述', value: 'description' },
        ], API.domain, 'domains', '域');
        this.newItemDialog = new NewDomainDialog();
    }
    async deleteSelected(){
        for (let i in this.selected) {
            let domain = this.selected[i];
            if (domain.enabled) {
                ALERT.warn(`Domin ${domain.name} 处于enabled状态，请先disable再删除`);
                continue;
            }
            await API.domain.delete(domain.id);
        }
        this.refresh();
        this.selected = [];
    }
    async toggleEnabled(domain){
        try {
            if (domain.enabled){
                await API.domain.enable(domain.id)
                MESSAGE.success(`Domain ${domain.name} 已启用`)
            } else {
                await API.domain.disable(domain.id)
                MESSAGE.success(`Domain ${domain.name} 已关闭`)
            }
        } catch {
            MESSAGE.success(`Domain ${domain.name} 操作失败`)
            domain.enabled = ! domain.enabled;
        }
    }

}
export class ProjectTable extends DataTable {
    constructor() {
        super([
            { text: '名字', value: 'name' },
            { text: 'domain_id', value: 'domain_id' },
            { text: 'enabled', value: 'enabled' },
            { text: '操作', value: 'actions' },
        ], API.project, 'projects', '租户');
        this.extendItems = [
            {text: 'id', value: 'id'},
            {text: 'description', value: 'description'},
        ]
        this.newItemDialog = new NewProjectDialog();
    }
    async waitDeleted(id){ }
}
export class RoleTable extends DataTable {
    constructor() {
        super([
            { text: 'ID', value: 'id' },
            { text: '名字', value: 'name' },
            { text: 'domain_id', value: 'domain_id' },
        ], API.role, 'roles', '角色');
        this.domainId = null;
    }
    async refresh(filters = {}) {
        if (this.domainId) {
            filters.domain_id = this.domainId;
        }
        super.refresh(filters)
    };
    async waitDeleted(id){ }
}
export class HypervisortTable extends DataTable {
    constructor() {
        super([
            { text: '主机名', value: 'hypervisor_hostname', class: 'blue--text' },
            { text: '已用内存/总内存', value: 'memory_mb', class: 'blue--text' },
            { text: '已用CPU/总CPU', value: 'vcpus', class: 'blue--text' },
            { text: '状态', value: 'status', class: 'blue--text' },
            { text: 'IP', value: 'host_ip', class: 'blue--text' },
            { text: '虚拟化版本', value: 'hypervisor_version', class: 'blue--text' },
        ], API.hypervisor, 'hypervisors')
        this.statistics = {};
        this._memUsedPercent = 0;
        this._vcpuUsedPercent = 0;
        this.extendItems = [
            { text: 'extra_resources', value: 'extra_resources'},
            { text: 'numa_node_0_cpuset', value: 'numa_node_0_cpuset'},
            { text: 'numa_node_1_cpuset', value: 'numa_node_1_cpuset'},
            { text: 'numa_node_0_hugepages', value: 'numa_node_0_hugepages'},
            { text: 'numa_node_1_hugepages', value: 'numa_node_1_hugepages'},
        ];
        this.tenantUsageDialog = new TenantUsageDialog();
    }
    async refreshStatics() {
        this.statistics = (await API.hypervisor.statistics()).hypervisor_statistics;
        this._memUsedPercent = (this.statistics.memory_mb_used * 100 / this.statistics.memory_mb).toFixed(2);
        this._vcpuUsedPercent = (this.statistics.vcpus_used * 100 / this.statistics.vcpus).toFixed(2);
        this._diskUsedPercent = (this.statistics.local_gb_used * 100 / this.statistics.local_gb).toFixed(2);
    }
    async refresh() {
        super.refresh();
        // await this.refreshStatics();
        // this.getMemUsedPercent();
    }
    getMemUsedPercent() {
        console.log(this.statistics.memory_mb_used, this.statistics.memory_mb)
    }
}

export class AZDataTable extends DataTable {
    constructor() {
        super([
            { text: '主机名', value: 'name', class: 'blue--text' },
            { text: '服务', value: 'service', class: 'blue--text' },
            { text: '状态', value: 'active', class: 'blue--text' },
            { text: 'available', value: 'available', class: 'blue--text' },
        ], API.az, 'availabilityZoneInfo')
        this.azMap = {internal: {hosts: []}}
        this.statistics = {};
        this.zoneName = 'internal';
        this.showTree = 0;
    }
    async refresh() {
        await super.refresh();
        this.items.forEach(az => {
            this.azMap[az.zoneName] = {
                zoneState: az.zoneState,
                hosts: [],
            }
            for (let hostName in az.hosts) {
                for (let service in az.hosts[hostName]) {
                    this.azMap[az.zoneName].hosts.push({
                        name: hostName,
                        service: service,
                        available: az.hosts[hostName][service].available,
                        active: az.hosts[hostName][service].active,
                        updated_at: az.hosts[hostName][service].updated_at
                    })
                }
            }
        })
    }
    async drawTopoloy(eleId) {
        await Utils.sleep(1);
        var chartDom = document.getElementById(eleId);
        var myChart = echarts.init(chartDom);
        let data = { name: '集群', children: [] }
        for (let i in this.items) {
            let azInfo = this.items[i];
            let children = [];
            for (let hostName in azInfo.hosts) {
                let services = []
                children.push({ name: hostName, children: services })
                for (let serviceType in azInfo.hosts[hostName]) {
                    services.push({ name: serviceType, })
                }
            }
            data.children.push({ name: azInfo.zoneName, children: children, })
        }
        myChart.setOption({
            tooltip: { trigger: 'item', triggerOn: 'mousemove' },
            series: [
                {
                    type: 'tree', data: [data], symbolSize: 20,
                    label: {
                        position: 'left', verticalAlign: 'middle', align: 'right', fontSize: 14
                    },
                    leaves: {
                        label: {
                            position: 'right', verticalAlign: 'middle', align: 'left'
                        }
                    },
                    emphasis: {focus: 'descendant'},
                    expandAndCollapse: true,
                    animationDuration: 550,
                    animationDurationUpdate: 750
                }
            ]
        });
        myChart.resize();
    }
}
export class AggDataTable extends DataTable {
    constructor() {
        super([
            { text: 'ID', value: 'uuid', class: 'blue--text' },
            { text: '名字', value: 'name', class: 'blue--text' },
            { text: '域', value: 'availability_zone', class: 'blue--text' },
            { text: '节点数量', value: 'host_num', class: 'blue--text' },
        ], API.agg, 'aggregates', '聚合');
        this.extendItems = [
            { text: 'created_at', value: 'created_at'},
            { text: 'updated_at', value: 'updated_at'},
            { text: 'metadata', value: 'metadata'},
            { text: 'hosts', value: 'hosts'},
        ];
        this.newItemDialog = new NewAggDialog();
        this.aggHostsDialog = new AggHostsDialog();
    }
    async removeHosts(){
        await this.aggHostsDialog.removeHosts();
        this.refresh()
    }
    async addHosts(){
        await this.aggHostsDialog.addHosts();
        this.refresh();
    }
}
export class ImageDataTable extends DataTable{
    constructor() {
        super([
            { text: '名字', value: 'name' },
            { text: '状态', value: 'status' },
            { text: '大小', value: 'size', align: 'end' },
            { text: 'visibility', value: 'visibility' },
            { text: 'container_format', value: 'container_format', align: 'center' },
            { text: 'disk_format', value: 'disk_format', align: 'center' },
            { text: '操作', value: 'actions', align: 'center' },
        ], API.image, 'images')
        this.extendItems = [
            { text: 'id', value: 'id' },
            { text: 'protected', value: 'protected' },
            { text: 'direct_url', value: 'direct_url' },
            { text: 'container_format', value: 'container_format' },
            { text: 'disk_format', value: 'disk_format' },
            { text: 'created_at', value: 'created_at' },
            { text: 'checksum', value: 'checksum' },
            { text: 'block_device_mapping', value: 'block_device_mapping' },
        ]
        this.KB = 1024;
        this.MB = this.KB * 1024;
        this.GB = this.MB * 1024;
        this.newItemDialog = new NewImageDialog()
        this.tasksDialog = new TasksDialog();
    }
    humanSize(image) {
        if (! image.size ) {
            return '' ;
        }
        else if (image.size >= this.GB) {
            return `${(image.size / this.GB).toFixed(2)} GB` ;
        } else if(image.size >= this.MB) {
            return `${(image.size / this.MB).toFixed(2)} MB`;
        } else if(image.size >= this.KB) {
            return `${(image.size / this.KB).toFixed(2)} KB`;
        } else {
            return `${image.size} B`
        }
    }
}

export class MigrationDataTable extends DataTable{
    constructor() {
        super([
            { text: '类型', value: 'migration_type' },
            { text: '实例ID', value: 'instance_uuid' },
            { text: '源节点', value: 'source_compute' },
            { text: '目的节点', value: 'dest_compute' },
            { text: '旧规格', value: 'old_instance_type_id' },
            { text: '新规格', value: 'new_instance_type_id' },
            { text: '开始时间', value: 'created_at' },
            { text: '状态', value: 'status'},
        ], API.migration, 'migrations')
        // this.extendItems = []
    }
}

export default DataTable;
