// import Vue from 'vue';
import * as Echarts from 'echarts';
import i18n from '@/assets/app/i18n.js'
import API from './api.js'
// import I18N from './i18n.js';
import { LOG, ServerTasks, Utils } from './lib.js'
import Notify from '@/assets/app/notify'
// const {appContitle: {config: globalProperties}} = getCurrentInstance()

// const vue = globalProperties;

class DataTable {
    constructor(headers, api, bodyKey = null, name = '') {
        this.headers = headers || [];
        this.api = api;
        this.bodyKey = bodyKey;
        this.name = name;
        this.itemsPerPage = 20;
        this.search = '';
        this.items = [];
        this.statistics = {};
        this.selected = []
        this.extendItems = []
        this.newItemDialog = null;
        this.loading = false;
        this.columns = this.headers.map((header) => { return header.key });
    }
    async openNewItemDialog() {
        if (this.newItemDialog) {
            this.newItemDialog.open();
        }
    }
    async createNewItem() {
        if (this.newItemDialog) {
            await this.newItemDialog.commit();
            this.refresh();
        }
    }
    async deleteSelected() {
        if (this.selected.length == 0) {
            return;
        }
        Notify.info(`开始删除`);
        let deleting = [];
        for (let i in this.selected) {
            let item = this.selected[i];
            try {
                await this.api.delete(item);
                deleting.push(item);
                this.watchDeleting(item)
            } catch {
                Notify.error(`删除 ${item} 失败`)
            }
        }
        this.resetSelected()
    }
    async watchDeleting(itemId) {
        do {
            try {
                let item = await (this.api.show(itemId))
                this.updateItem(item);
                Utils.sleep(2)
            } catch (e) {
                if (e.response.status == 404) {
                    console.error(e)
                    Notify.success(`${this.name} ${itemId} 已删除`)
                    this.removeItem(itemId)
                    break;
                }
            }
        } while (true)
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
                if (this.items[i][key] == newItem[key]) {
                    continue
                }
                this.items[i][key] = newItem[key];
            }
            break
        }
    }
    removeItem(id) {
        let index = -1;
        for (let i in this.items) {
            if (this.items[i].id == id) {
                index = i
                break;
            }
        }
        if (index >= 0) {
            this.items.splice(index, 1)
        }
    }
    async refresh(filters = {}) {
        this.loading = true;
        let result = null
        try {
            if (this.api.detail) {
                result = await this.api.detail(filters);
            } else {
                result = await this.api.list(filters)
            }
        } catch {
            Notify.error(`${this.name || '资源'} 查询失败`)
            return;
        } finally {
            this.loading = false;
        }
        this.items = this.bodyKey ? result[this.bodyKey] : result;
        return result;
    }
    getSelecedItems() {
        let items = [];
        for (let i in this.items) {
            if (this.selected.indexOf(this.items[i].id) < 0) {
                continue
            }
            items.push(this.items[i])
        }
        return items;
    }
}

export class Server {
    constructor(serverObj) {
        this.serverObj = serverObj;
    }
    getId() {
        return this.serverObj['id'];
    }
    getVolumesAttached() {
        return this.serverObj['os-extended-volumes:volumes_attached']
    }
    getRootDeviceName() {
        return this.serverObj['OS-EXT-SRV-ATTR:root_device_name'];
    }
    isDeleted() {
        return this.serverObj.status.toUpperCase() == 'DELETED';
    }
    async getRootBdm() {
        if (this.isDeleted()) {
            return
        }
        let volumesAttached = this.getVolumesAttached();
        if (volumesAttached.length == 0) {
            return null;
        }
        let rootDeviceName = this.getRootDeviceName();
        let attachments = (await API.server.volumeAttachments(this.serverObj['id'])).volumeAttachments;
        for (let i in attachments) {
            if (attachments[i].device == rootDeviceName) {
                return attachments[i];
            }
        }
        return null;
    }
}


export class RouterDataTable extends DataTable {
    constructor() {
        super([
            { title: 'id', key: 'id' },
            { title: 'name', key: 'name' },
            { title: 'status', key: 'status' },
            { title: 'revision_number', key: 'revision_number' },
            { title: 'routes', key: 'routes' },
            { title: 'admin_state_up', key: 'admin_state_up' },
        ], API.router, 'routers');
        this.extendItems = [
            { title: 'description', key: 'description' },
            { title: 'created_at', key: 'created_at' },
            { title: 'project_id', key: 'project_id' },
            { title: 'tags', key: 'tags' },
            { title: 'external_gateway_info', key: 'external_gateway_info' },
        ];
    }
    adminStateDown(item) {
        API.router.put(item.id, { router: { admin_state_up: item.admin_state_up } }).then(() => {
            if (item.admin_state_up) {
                Notify.success(`路由 ${item.name} 已设置为 UP`)
            } else {
                Notify.success(`路由 ${item.name} 已设置为 DOWN`)
            }
        })
    }
}

export class NetDataTable extends DataTable {
    constructor() {
        super([
            { title: 'ID', key: 'id' },
            { title: '名字', key: 'name' },
            { title: '状态', key: 'status' },
            { title: '网络类型', key: 'provider:network_type' },
            { title: 'MTU', key: 'mtu' },
            { title: '子网', key: 'subnets' },
            { title: '共享', key: 'shared' },
            { title: '启用', key: 'admin_state_up' },
        ], API.network, 'networks', '网络');
        this.extendItems = [
            { title: 'description', key: 'description' },
            { title: 'enable_dhcp', key: 'enable_dhcp' },
            { title: 'created_at', key: 'created_at' },
            { title: 'project_id', key: 'project_id' },
            { title: 'qos_policy_id', key: 'qos_policy_id' },
            { title: 'port_security_enabled', key: 'port_security_enabled' },
            { title: 'ipv4_address_scope', key: 'ipv4_address_scope' },
            { title: 'provider:physical_network', key: 'provider:physical_network' },
            { title: 'provider:segmentation_id', key: 'provider:segmentation_id' },
            { title: 'dns_domain', key: 'dns_domain' },
            { title: 'vlan_transparent', key: 'vlan_transparent' },
        ];
        this.subnets = {};
    }
    async refreshSubnets() {
        // use network.subnets
        let subnets = (await API.subnet.list()).subnets;
        subnets.forEach(item => {
            this.subnets[item.id] = item;
        })
    }
    async deleteSubnet(subnet_id) {
        let subnet = this.subnets[subnet_id];
        try {
            await API.subnet.delete(subnet_id)
        } catch (error) {
            Notify.error(`子网 ${subnet.cidr} 删除失败， ${error.response.data.NeutronError.Notify}`)
            return;
        }
        Notify.success(`子网 ${subnet.cidr} 删除成功`);
        // netTable.refresh();
    }
    async adminStateDown(item) {
        await API.network.put(item.id, { network: { admin_state_up: item.admin_state_up } })
        if (item.admin_state_up) {
            Notify.success(`网络 ${item.name} 已设置为 UP`)
        } else {
            Notify.success(`网络 ${item.name} 已设置为 down`)
        }
    }
    async shared(item) {
        try {
            await API.network.put(item.id, { network: { shared: !item.shared } })
            if (item.shared) {
                Notify.success(`网络 ${item.name} 已设置为共享`)
            } else {
                Notify.success(`网络 ${item.name} 已取消共享`)
            }
        } catch (e) {
            item.shared = !item.shared;
            Notify.error(`网络 ${item.name} 更新失败: ${e}`)
        }
    }
}
export class PortDataTable extends DataTable {
    constructor() {
        super([
            { title: 'ID', key: 'id' },
            { title: 'Name', key: 'name' },
            { title: 'vnic_type', key: 'binding:vnic_type' },
            { title: 'vif_type', key: 'binding:vif_type' },
            { title: 'status', key: 'status' },
            { title: 'fixed_ips', key: 'fixed_ips' },
            { title: '启用', key: 'admin_state_up' },
        ], API.port, 'ports');

        this.extendItems = [
            { title: 'device_owner', key: 'device_owner' },
            { title: 'binding:vif_details', key: 'binding:vif_details' },
            { title: 'binding:profile', key: 'binding:profile' },
            { title: 'binding:host_id', key: 'binding:host_id' },
            { title: 'network_id', key: 'network_id' },
            { title: 'device_id', key: 'device_id' },
            { title: 'security_groups', key: 'security_groups' },
            { title: 'mac_address', key: 'mac_address' },
            { title: 'qos_policy_id', key: 'qos_policy_id' },
            { title: 'description', key: 'description' },
        ];
    }
    adminStateDown(item) {
        API.port.put(item.id, { port: { admin_state_up: item.admin_state_up } }).then(() => {
            if (item.admin_state_up) {
                Notify.success(`端口 ${item.name || item.id} 已设置为 UP`)
            } else {
                Notify.success(`端口 ${item.name || item.id} 已设置为 DOWN`)
            }
        }).catch(error => {
            console.error(error);
            Notify.error(`端口 ${item.name} 更新失败`);
            item.admin_state_up = !item.admin_state_up;
        })
    }
}
export class SecurityGroupDataTable extends DataTable {
    constructor() {
        super([
            { title: 'id', key: 'id' },
            { title: '名字', key: 'name' },
            { title: 'revision_number', key: 'revision_number' },
            { title: '租户ID', key: 'tenant_id' },
            { title: '操作', key: 'actions' },
        ], API.sg, 'security_groups');
        this.extendItems = [
            { title: 'description', key: 'description' },
            { title: 'created_at', key: 'created_at' },
            { title: 'updated_at', key: 'updated_at' },

        ];
    }
}
export class QosPolicyDataTable extends DataTable {
    constructor() {
        super([
            { title: 'id', key: 'id' },
            { title: '名字', key: 'name' },
            { title: '修订号', key: 'revision_number' },
            { title: '是否默认', key: 'is_default' },
            { title: '是否共享', key: 'shared' },
            { title: '操作', key: 'actions' },
        ], API.qosPolicy, 'policies');
        this.extendItems = [
            { title: '标签', key: 'tags' },
            { title: 'rules', key: 'rules' },
            { title: 'created_at', key: 'created_at' },
            { title: 'updated_at', key: 'updated_at' },
            { title: 'description', key: 'description' },
        ];
    }
    async updateDefault(item) {
        let data = { is_default: !item.is_default }
        try {
            await API.qosPolicy.put(item.id, { policy: data });
            Notify.success(`限速规则 ${item.name || item.id} 更新成功`)
        } catch (e) {
            item.is_default = !item.is_default;
            Notify.error(`限速规则 ${item.name || item.id} 更新失败: ${e}`)
        }
    }
    async updateShared(item) {
        let data = { shared: !item.shared }
        try {
            await API.qosPolicy.put(item.id, { policy: data });
            Notify.success(`限速规则 ${item.name || item.id} 更新成功`)
        } catch (e) {
            item.shared = !item.shared;
            Notify.error(`限速规则 ${item.name || item.id} 更新失败: ${e}`)
        }
    }
}
export class FlavorDataTable extends DataTable {
    constructor() {
        super([{ title: 'ID', key: 'id' },
        { title: '名字', key: 'name' },
        { title: 'vcpu', key: 'vcpus' },
        { title: '内存', key: 'ram' },
        { title: '磁盘', key: 'disk' },
        { title: 'swap', key: 'swap' },
        { title: 'ephemeral', key: 'OS-FLV-EXT-DATA:ephemeral' },
        ], API.flavor, 'flavors', '规格');
        this.MiniHeaders = [
            { title: '名字', key: 'name' },
            { title: 'vcpu', key: 'vcpus' },
            { title: '内存', key: 'ram' },
        ]
        this.extraSpecsMap = {};
        this.isPublic = true;
    }

    async refreshExtraSpecs() {
        for (let i in this.items) {
            let item = this.items[i];
            let body = await API.flavor.getExtraSpecs(item.id);
            this.extraSpecsMap[item.id] = body.extra_specs;
            // Vue.set(this.extraSpecsMap, item.id, body.extra_specs);
        }

    }
    async refresh() {
        await super.refresh({ is_public: this.isPublic })
        this.refreshExtraSpecs()
    }
}
export class KeypairDataTable extends DataTable {
    constructor() {
        super([{ title: '名字', key: 'name' },
        { title: '类型', key: 'type' },
        { title: '密钥指纹', key: 'fingerprint' }
        ], API.keypair, 'keypairs', '密钥对');
        // this.extendItems = [
        //     { title: '公钥', key: 'public_key' },
        // ]
    }
    static copyPublicKey(item) {
        Utils.copyToClipboard(item.public_key)
        Notify.success(`公钥内容已复制`);
    }
    getSelecedItems() {
        let items = [];
        for (let i in this.items) {
            if (this.selected.indexOf(this.items[i].name) < 0) {
                continue
            }
            items.push(this.items[i])
        }
        return items;
    }
    async refresh(filters = {}) {
        this.loading = true;
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
        this.loading = false;
        return body
    }
    removeItem(name) {
        let index = -1;
        for (let i in this.items) {
            if (this.items[i].name == name) {
                index = i
                break;
            }
        }
        if (index >= 0) {
            this.items.splice(index, 1)
        }
    }
}

export class ServerDataTable extends DataTable {
    constructor() {
        super([{ title: '实例名字', key: 'name' },
        { title: '节点', key: 'OS-EXT-SRV-ATTR:host' },
        { title: '规格', key: 'flavor' },
        { title: '镜像', key: 'image' },
        { title: 'IP地址', key: 'addresses' },
        { title: '状态', key: 'status' },
        { title: '电源', key: 'power_state' },
        { title: '操作', key: 'action' },
        ], API.server, 'servers', '实例');
        this.extendItems = [
            { title: 'UUID', key: 'id' },
            { title: '实例名', key: 'OS-EXT-SRV-ATTR:instance_name' },
            { title: '创建时间', key: 'created' },
            { title: '更新时间', key: 'updated' },
            { title: '规格', key: 'flavor' },
            { title: '租户ID', key: 'tenant_id' },
            { title: '用户ID', key: 'iduser_id' },
            { title: 'diskConfig', key: 'OS-DCF:diskConfig' },
            { title: '错误信息', key: 'fault' },
        ];
        this.imageMap = {};
        this.rootBdmMap = {};
        this.errorNotify = {};
        this.deleted = false;
        this.imageName = {};
        this.filterName = ""
    }
    refresh(filters = {}) {
        // search only for server.name
        filters.deleted = this.deleted
        if (this.filterName != "") {
            filters.name = this.filterName;
        }
        super.refresh(filters);
    }
    openResetStateDialog() {
        this.resetStateDialog.open(this);
    }

    async recheckSavedTasks() {
        let serverTasks = new ServerTasks();
        for (let serverId in serverTasks.getAll()) {
            let servers = (await API.server.list({ uuid: serverId })).servers;
            if (!servers || servers.length == 0) {
                serverTasks.delete(serverId)
                continue;
            }
            console.log('waitServerStatus ' + serverId)
            this.waitServerStatus(serverId).then(() => {
                serverTasks.delete(serverId);
            });
        }
    }
    async waitServerMoved(server) {
        let srcHost = server['OS-EXT-SRV-ATTR:host'];
        let serverUpdated = {};
        do {
            let body = await API.server.get(server.id);
            serverUpdated = body.server;
            this.updateItem(serverUpdated);

            if (serverUpdated['OS-EXT-STS:task_state']) {
                await Utils.sleep(5)
            } else if (serverUpdated['OS-EXT-SRV-ATTR:host'] == srcHost) {
                throw Error(`疏散失败`);
            }
        } while (!serverUpdated['OS-EXT-STS:task_state'] && serverUpdated['OS-EXT-SRV-ATTR:host'] != srcHost)
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
        do {
            if (currentServer.status) {
                await Utils.sleep(5)
            }
            currentServer = await API.server.show(server_id);
            if (currentServer['OS-EXT-STS:task_state'] != oldTaskState) {
                this.updateItem(currentServer);
                oldTaskState = currentServer['OS-EXT-STS:task_state'];
            }
            LOG.debug(`wait server ${server_id} to be ${expectStatusList}, now: ${currentServer.status.toUpperCase()}`)
        } while (expectStatusList.indexOf(currentServer.status.toUpperCase()) < 0)
        this.updateItem(currentServer);
        return currentServer
    }
    async waitServerTaskCompleted(server_id, taskState) {
        let expectStateList = typeof taskState == 'string' ? [taskState] : taskState
        let currentServer = {};
        let oldTaskState = ''
        do {
            if (currentServer['OS-EXT-STS:task_state']) {
                await Utils.sleep(5)
            }
            let body = await API.server.get(server_id);
            currentServer = body.server;
            if (currentServer['OS-EXT-STS:task_state'] != oldTaskState) {
                this.updateItem(currentServer);
            }
            LOG.debug(`wait server ${server_id} task state to be ${expectStateList}, now: ${currentServer['OS-EXT-STS:task_state']}`);
        } while (expectStateList.indexOf(currentServer['OS-EXT-STS:task_state']) >= 0);
        return currentServer
    }
    async stopServers(servers) {
        for (let i in servers) {
            let server = servers[i];
            await API.server.stop(server.id);
            this.waitServerStopped(server)
        }
    }
    async stopSelected() {
        let statusMap = { inactive: [], active: [] };
        for (let i in this.selected) {
            let serverId = this.selected[i]
            let item = (await API.server.show(serverId))
            if (item.status.toUpperCase() != 'ACTIVE') {
                statusMap.inactive.push(item);
                continue;
            }
            statusMap.active.push(item);
        }
        if (statusMap.active.length != 0) {
            Notify.info(`开始关机: ${statusMap.active.map((item) => { return item.name })} `);
            this.stopServers(statusMap.active)
        }
        if (statusMap.inactive.length != 0) {
            Notify.warning(`虚拟机不是运行状态: ${statusMap.inactive.map((item) => { return item.name })}`);
        }
    }
    async startServers(servers) {
        for (let i in servers) {
            let item = servers[i];
            await this.api.start(item.id)
            this.waitServerStarted(item, 'start')
        }
    }
    async startSelected() {
        let statusMap = { notShutoff: [], shutoff: [] };
        for (let i in this.selected) {
            let serverId = this.selected[i]
            let item = (await API.server.show(serverId))
            if (item.status.toUpperCase() != 'SHUTOFF') {
                console.log(item.name, item.status)
                statusMap.notShutoff.push(item);
                continue;
            }
            statusMap.shutoff.push(item);
        }
        if (statusMap.shutoff.length != 0) {
            Notify.info(`开始开机: ${statusMap.shutoff.map((item) => { return item.name })} `);
            await this.startServers(statusMap.shutoff);
        }
        if (statusMap.notShutoff.length != 0) {
            Notify.warning(`虚拟机不是关机状态: ${statusMap.notShutoff.map((item) => { return item.name })}`);
        }
        this.resetSelected();
    }
    async pauseSelected() {
        let self = this;
        for (let i in this.selected) {
            let serverId = this.selected[i]
            let item = (await API.server.show(serverId))
            if (item.status.toUpperCase() != 'ACTIVE') {
                Notify.warning(`虚拟机 ${item.name} 不是运行状态`)
                continue;
            }
            await self.api.pause(item.id);
            this.waitServerPaused(item)
        }
        this.resetSelected();
    }
    async unpauseSelected() {
        let self = this;
        for (let i in this.selected) {
            let serverId = this.selected[i]
            let item = (await API.server.show(serverId))
            if (item.status.toUpperCase() != 'PAUSED') {
                Notify.warning(`虚拟机 ${item.name} 不是暂停状态`)
                continue;
            }
            await self.api.unpause(item.id);
            this.waitServerUnpaused(item)
        }
        this.resetSelected();
    }
    async rebootSelected(type = 'SOFT') {
        for (let i in this.selected) {
            let serverId = this.selected[i]
            let item = (await API.server.show(serverId))
            if (type == 'SOFT' && item.status.toUpperCase() != 'ACTIVE') {
                Notify.warning(`虚拟机 ${item.name} 不是运行状态`, 1)
                continue;
            }
            API.server.reboot(item.id)
            this.waitServerStarted(item, "reboot")
        }
        this.resetSelected();
    }

    async updateImageName(server) {
        let imageId = server.image && server.image.id;
        if (!imageId) {
            return
        }
        if (Object.keys(this.imageName).indexOf(imageId) >= 0) {
            return
        }
        this.imageName[imageId] = imageId
        let image = await API.image.get(imageId)
        this.imageName[imageId] = image.name
    }

    getRootBdm(server) {
        let self = this;
        if (!server['os-extended-volumes:volumes_attached']) {
            return null;
        }
        let serverObj = new Server(server);
        if (Object.keys(this.rootBdmMap).indexOf(serverObj.getId()) < 0) {
            Vue.set(this.rootBdmMap, serverObj.getId(), {});
            serverObj.getRootBdm().then(bdm => {
                self.rootBdmMap[serverObj.getId()] = bdm;
            });
        }
        return this.rootBdmMap[serverObj.getId()];
    }
    parseAddresses(server) {
        let addressMap = {};
        for (let netName in server.addresses) {
            for (let i in server.addresses[netName]) {
                let address = server.addresses[netName][i]
                if (Object.keys(addressMap).indexOf(address['OS-EXT-IPS-MAC:mac_addr']) < 0) {
                    addressMap[address['OS-EXT-IPS-MAC:mac_addr']] = []
                }
                addressMap[address['OS-EXT-IPS-MAC:mac_addr']].push(address.addr)
            }
        }
        return Object.values(addressMap);
    }
    parseFirstAddresses(server) {
        let addressMap = {};
        for (let netName in server.addresses) {
            for (let i in server.addresses[netName]) {
                let address = server.addresses[netName][i]
                if (Object.keys(addressMap).indexOf(address['OS-EXT-IPS-MAC:mac_addr']) < 0) {
                    addressMap[address['OS-EXT-IPS-MAC:mac_addr']] = []
                }
                addressMap[address['OS-EXT-IPS-MAC:mac_addr']].push(address.addr)
            }
            break
        }
        if (Object.values(addressMap).length > 0) {
            return Object.values(addressMap)[0]
        } else {
            return []
        }
    }
    async waitServerStarted(server, action) {
        let refreshServer = await this.waitServerStatus(server.id, ['ACTIVE', 'ERROR'])
        if (refreshServer.status.toUpperCase() == 'ACTIVE') {
            Notify.success(`${server.name || server.id} ${action} 成功`)
        } else {
            Notify.error(`${server.name || server.id} ${action} 失败`)
        }
    }
    async waitServerStopped(server) {
        let action = 'stop'
        let refreshServer = await this.waitServerStatus(server.id, ['SHUTOFF', 'ERROR'])
        if (refreshServer.status.toUpperCase() == 'SHUTOFF') {
            Notify.success(`${server.name || server.id} ${action} 成功`)
        } else {
            Notify.error(`${server.name || server.id} ${action} 失败`)
        }
    }
    async waitServerPaused(server) {
        let action = 'pause'
        let refreshServer = await this.waitServerStatus(server.id, ['PAUSED', 'ERROR'])
        if (refreshServer.status.toUpperCase() == 'PAUSED') {
            Notify.success(`${server.name || server.id} ${action} 成功`)
        } else {
            Notify.error(`${server.name || server.id} ${action} 失败`)
        }
    }
    async waitServerUnpaused(server) {
        let action = 'unpause'
        let refreshServer = await this.waitServerStatus(server.id, ['ACTIVE', 'ERROR'])
        if (refreshServer.status.toUpperCase() == 'ACTIVE') {
            Notify.success(`${server.name || server.id} ${action} 成功`)
        } else {
            Notify.error(`${server.name || server.id} ${action} 失败`)
        }
    }
    async waitServerMigrated(server) {
        let action = "migrate"
        // TODO: show server first
        let srcHost = server['OS-EXT-SRV-ATTR:host'];
        let refreshServer = await this.waitServerStatus(server.id, [server.status, 'ERROR'])
        if (refreshServer['OS-EXT-SRV-ATTR:host'] != srcHost) {
            Notify.success(`${server.name || server.id} ${action} 成功`)
        } else {
            Notify.error(`${server.name || server.id} ${action} 失败`)
        }
    }
    async waitServerDeleted(serverId) {
        do {
            try {
                let server = await (API.server.show(serverId))
                this.updateItem(server);
                Utils.sleep(2)
            } catch (e) {
                if (e.response.status == 404) {
                    console.error(e)
                    Notify.success(`实例 ${serverId} 已删除`)
                    this.removeItem(serverId)
                    break;
                }
            }
        } while (true)
    }
}
export class ComputeServiceTable extends DataTable {
    constructor() {
        super([{ title: '服务', key: 'binary' },
        { title: '主机', key: 'host' },
        { title: 'zone', key: 'zone' },
        { title: '服务状态', key: 'state' },
        { title: '启用', key: 'status' },
        { title: '强制down', key: 'forced_down' },
        { title: '更新时间', key: 'updated_at' },
        ], API.computeService, 'services')
    }
    async forceDown(service) {
        try {
            await API.computeService.forceDown(service.id, !service.forced_down)
            if (service.forced_down) {
                Notify.success(`${service.host}:${service.binary} 已强制设为 Down`)
            } else {
                Notify.success(`${service.host}:${service.binary} 已取消强制 Down`)
            }
        } catch (error) {
            console.error(error)
            Notify.error(`${service.host}:${service.binary} 设置强制down失败`)
            service.forced_down = !service.forced_down;
            return;
        }
        // this.refresh();
    }
    toggleEnable(service) {
        let status = service.status;
        if (status == 'enabled') {
            service.status = 'disabled';
            API.computeService.disable(service.id).then(() => {
                Notify.success(`${service.host}:${service.binary} 已设置为不可用`)
            }).catch(error => {
                console.error(error);
                Notify.error(`${service.host}:${service.binary} 设置不可用失败`)
                service.status = 'enabled';
            });
        } else {
            service.status = 'enabled';
            API.computeService.enable(service.id).then(() => {
                Notify.success(`${service.host}:${service.binary} 已设置为可用`)
            }).catch(error => {
                Notify.error(`${service.host}:${service.binary} 设置可用失败`)
                service.status = 'enabled';
                console.error(error)
            });
        }
    }
}
export class ServerGroupTable extends DataTable {
    constructor() {
        super([
            { title: 'ID', key: 'id' },
            { title: '名字', key: 'name' },
            { title: '策略', key: 'policies' },
            { title: '自定义', key: 'custom' },
            { title: '成员', key: 'members' },
        ], API.serverGroup, 'server_groups', '群组');
    }
}
export class UsageTable extends DataTable {
    constructor() {
        super([
            { title: '租户ID', key: 'tenant_id' },
            { title: '总内存使用', key: 'total_memory_mb_usage' },
            { title: '总cpu使用', key: 'total_vcpus_usage' },
            //    { title: '实例使用', key: 'server_usages' },
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
        super([
            { title: 'ID', key: 'id' },
            { title: '名字', key: 'name' },
            { title: '状态', key: 'status' },
            { title: '大小', key: 'size' },
            { title: '卷类型', key: 'volume_type' },
            { title: '镜像名', key: 'image_name' },
            { title: '操作', key: 'actions' },
        ], API.volume, 'volumes', '卷');
        this.extendItems = [
            { title: 'description', key: 'description' },
            { title: 'attached_servers', key: 'attached_servers' },
            { title: 'migration_status', key: 'migration_status' },
            { title: 'replication_status', key: 'replication_status' },
            { title: 'tenant_id', key: 'tenant_id' },
            { title: 'volume_image_metadata', key: 'volume_image_metadata' },
            { title: 'metadata', key: 'metadata' },
            { title: 'created_at', key: 'created_at' },
            { title: 'updated_at', key: 'updated_at' },
        ];
        // TODO: 补充其他状态
        this.doingStatus = [
            'creating', 'downloading', 'attaching', 'deleting'
        ]
    }
    isDoing(item) {
        return this.doingStatus.indexOf(item.status) >= 0;
    }
    extendSelected(newSize) {
        if (this.selected.length == 0) {
            return;
        }
        Notify.info(`开始扩容`);
        for (let i in this.selected) {
            let item = this.selected[i];
            try {
                this.api.extend(item.id, newSize);
            } catch {
                Notify.error(`扩容 ${item.name} ${item.id} 失败`)
            }
        }
        this.refresh();
    }
    async refresh(filters = {}) {
        // search only for volume.name or volume.id
        await super.refresh(filters);

        if (this.search) {
            let filterItems = [];
            for (let i in this.items) {
                if (this.items[i].id.includes(this.search)
                    || this.items[i].name.includes(this.search)) {
                    filterItems.push(this.items[i])
                }
            }
            this.items = filterItems
        }
    }
    async waitVolumeDeleted(volumeId) {
        do {
            try {
                let volume = (await API.volume.get(volumeId)).volume
                this.updateItem(volume)
                Utils.sleep(2)
            } catch (e) {
                if (e.response.status == 404) {
                    console.error(e)
                    Notify.success(`卷 ${volumeId} 已删除`)
                    this.removeItem(volumeId)
                    break;
                }
            }
        } while (true)
    }
}

export class VolumeTypeTable extends DataTable {
    constructor() {
        super([{ title: '名字', key: 'name' },
        { title: '是否公共', key: 'is_public' },
        { title: '属性', key: 'extra_specs' },
        ], API.volumeType, 'volume_types');
        this.extendItems = [
            { title: 'id', key: 'id' },
            { title: 'qos_specs_id', key: 'qos_specs_id' },
            { title: 'os-volume-type-access:is_public', key: 'avaios-volume-type-access:is_publiclability_zone' },
            { title: 'description', key: 'description' },
        ];
    }
}

export class SnapshotTable extends DataTable {
    constructor() {
        super([{ title: '名字', key: 'name' },
        { title: '状态', key: 'status' },
        { title: '大小', key: 'size' },
        { title: '卷ID', key: 'volume_id' },
        ], API.snapshot, 'snapshots', '快照');
        this.extendItems = [
            { title: '描述', key: 'description' },
            { title: 'created_at', key: 'created_at' },
            { title: 'updated_at', key: 'updated_at' },
        ]
    }
    async waitSnapshotCreated(snapshot_id) {
        let snapshot = {};
        let expectStatus = ['available', 'error'];
        let oldStatus = ''
        while (expectStatus.indexOf(snapshot.status) < 0) {
            snapshot = (await API.snapshot.get(snapshot_id)).snapshot;
            LOG.debug(`wait snapshot ${snapshot_id} status to be ${expectStatus}, now: ${snapshot.status}`)
            if (snapshot.status != oldStatus) {
                this.refresh();
            }
            oldStatus = snapshot.status;
            if (expectStatus.indexOf(snapshot.status) < 0) {
                await Utils.sleep(3);
            }
        }
        return snapshot
    }
}
export class BackupTable extends DataTable {
    constructor() {
        super([{ title: '名字', key: 'name' },
        { title: '状态', key: 'status' },
        { title: '大小', key: 'size' },
        { title: '卷ID', key: 'volume_id' },
        ], API.backup, 'backups', '备份');
        this.extendItems = [
            { title: 'id', key: 'id' },
            { title: 'fail_reason', key: 'fail_reason' },
            { title: 'snapshot_id', key: 'metadata' },
            { title: 'has_dependent_backups', key: 'has_dependent_backups' },
            { title: 'created_at', key: 'created_at' },
            { title: 'availability_zone', key: 'availability_zone' },
            { title: 'description', key: 'description' },
        ];
    }
    async waitBackupCreated(backupId) {
        let backup = {};
        let expectStatus = ['available', 'error'];
        let oldStatus = ''
        while (expectStatus.indexOf(backup.status) < 0) {
            backup = (await API.backup.get(backupId)).backup;
            LOG.debug(`wait backup ${backupId} status to be ${expectStatus}, now: ${backup.status}`)
            if (backup.status != oldStatus) {
                this.refresh();
            }
            oldStatus = backup.status;
            if (expectStatus.indexOf(backup.status) < 0) {
                await Utils.sleep(3);
            }
        }
        return backup
    }
    async waitBackupStatus(backupId, status) {
        let backup = {};
        while (backup.status != status) {
            try {
                LOG.debug(`wait backup ${backupId} status to be ${status}`)
                backup = (await API.backup.get(backupId)).backup;
                if (backup.status != status) {
                    await Utils.sleep(3);
                }
            } catch (error) {
                console.error(error);
                break
            }
        }
        this.refresh();
        return backup
    }
    async resetState(backupId) {
        console.info(`TODO resetState ${backupId}`)
        // API.backup.resetState(backupId, status =)
    }
}
export class VolumeServiceTable extends DataTable {
    constructor() {
        super([
            { title: '服务', key: 'binary' },
            { title: '可用状态', key: 'status' },
            { title: '服务状态', key: 'state' },
            { title: '节点', key: 'host' },
            { title: '更新时间', key: 'updated_at' },
        ], API.volumeService, 'services', '卷服务');
        this.extendItems = [
            { title: 'disabled_reason', key: 'disabled_reason' },
            { title: 'disabled_policy', key: 'disabled_policy' },
            { title: 'zone', key: 'zone' },
        ];
    }
    itemKey() {
        return this.index;
    }
    async refresh() {
        await super.refresh();
        // NOTE: For volume services, no id in items, so add id to make
        // v-data-table item-key works.
        let index = 0;
        for (let i in this.items) {
            this.items[i].id = index++;
        }
    }
    async toggleEnabled(item) {
        let body = null;
        switch (item.status) {
            case 'enabled':
                body = await API.volumeService.disable(item.binary, item.host);
                if (body.status == 'disabled') {
                    Notify.success(`${this.name} ${item.binary}:${item.host} 已设为不可用`)
                    this.refresh();
                } else {
                    item.status == 'enabled'
                }
                break;
            case 'disabled':
                body = await API.volumeService.enable(item.binary, item.host);
                if (body.status == 'enabled') {
                    Notify.success(`${this.name} ${item.binary}:${item.host} 已设为可用`)
                    this.refresh();
                } else {
                    item.status == 'diabled'
                }
                break;
        }
    }
}
export class VolumePoolTable extends DataTable {
    constructor() {
        super([
            { title: '名字', key: 'name' },
            { title: '后端名', key: 'volume_backend_name' },
            { title: '存储协议', key: 'storage_protocol' },
            { title: '实际容量(GB)', key: 'capacity_gb' },
            { title: '已置备', key: 'provisioned_capacity_gb' },
            { title: '已分配', key: 'allocated_capacity_gb' },
        ], API.volumePool, 'pools', '存储池');
        this.extendItems = [
            { title: 'capabilities', key: 'capabilities' },
        ];
    }
    itemKey() {
        return this.index;
    }
    async refresh() {
        await super.refresh();
        // NOTE: For volume services, no id in items, so add id to make
        // v-data-table item-key works.
        let index = 0;
        for (let i in this.items) {
            this.items[i].id = index++;
        }
    }
}

export class ClusterTable extends DataTable {
    constructor() {
        super([
            { title: '名字', key: 'name' },
            { title: '认证地址', key: 'auth_url' },
        ], API.cluster, 'clusters', '集群');
        this.selected = null;
        this.region = ''
    }
    async delete(item) {
        try {
            await API.cluster.delete(item.id)
            Notify.success(`集群 ${item.name || item.id} 删除成功`);
        } catch (error) {
            console.error('集群删除失败', error);
            Notify.error(`集群 ${item.name} 删除失败`);
            throw error;
        }
    }
    getSelectedCluster() {
        if (!this.selected) {
            return;
        }
        for (let i in this.items) {
            if (this.items[i].name == this.selected) {
                return this.items[i]
            }
        }
    }
    setSelected(clusterId) {
        for (let i in this.items) {
            let cluster = this.items[i];
            if (cluster.id == clusterId) {
                this.selected = cluster.name
                break
            }
        }
    }
}
export class RegionTable extends DataTable {
    constructor() {
        super([], API.region, 'regions', '地区');
        this.selected = ''
    }
    setSelected(region) {
        if (region) {
            this.selected = region
        }
    }
}
export class UserTable extends DataTable {
    constructor() {
        super([
            { title: 'ID', key: 'id' },
            { title: '名字', key: 'name' },
            { title: 'Domain', key: 'domain_id' },
            { title: '启用', key: 'enabled' },
        ], API.user, 'users', '用户');
    }
}
export class DomainTable extends DataTable {
    constructor() {
        super([
            { title: 'ID', key: 'id' },
            { title: '名字', key: 'name' },
            { title: '启用', key: 'enabled' },
            { title: '描述', key: 'description' },
        ], API.domain, 'domains', '域');
        // this.newItemDialog = new NewDomainDialog();
    }
    async deleteSelected() {
        let items = this.getSelecedItems();
        for (let i in items) {
            let domain = items[i];
            if (domain.enabled) {
                Notify.warning(`Domin ${domain.name} 处于enabled状态, 请先设置disable后再删除`);
                return;
            }
            await API.domain.delete(domain.id);
            Notify.success(`Domin ${domain.name} 已删除`);
        }
        // this.refresh();
    }
    async toggleEnabled(domain) {
        try {
            if (domain.enabled) {
                await API.domain.disable(domain.id)
                Notify.success(`Domain ${domain.name} 已关闭`)
            } else {
                await API.domain.enable(domain.id)
                Notify.success(`Domain ${domain.name} 已启用`)
            }
        } catch {
            Notify.success(`Domain ${domain.name} 操作失败`)
            domain.enabled = !domain.enabled;
        }
    }

}
export class ProjectTable extends DataTable {
    constructor() {
        super([
            { title: '名字', key: 'name' },
            { title: 'domain_id', key: 'domain_id' },
            { title: 'enabled', key: 'enabled' },
            { title: '操作', key: 'actions' },
        ], API.project, 'projects', '租户');
        this.extendItems = [
            { title: 'id', key: 'id' },
            { title: 'description', key: 'description' },
        ]
        this.userTable = new UserTable();
        // this.usersDialog = new UsersDialog();
        // this.newItemDialog = new NewProjectDialog();
    }

    openUserTable() {
        this.userTable.refresh()
        this.usersDialog.open()
    }
}

export class RoleTable extends DataTable {
    constructor() {
        super([
            { title: 'ID', key: 'id' },
            { title: '名字', key: 'name' },
            { title: 'domain_id', key: 'domain_id' },
        ], API.role, 'roles', '角色');
        this.domainId = null;
    }
    async refresh(filters = {}) {
        if (this.domainId) {
            filters.domain_id = this.domainId;
        }
        super.refresh(filters)
    }
}
export class EndpointTable extends DataTable {
    constructor() {
        super([
            { title: '服务名', key: 'service_name' },
            { title: '服务类型', key: 'service_type' },
            { title: '接口', key: 'interface' },
            { title: 'url', key: 'url' },
            { title: 'region', key: 'region' }
        ], API.endpoint, 'endpoints');
        // this.newItemDialog = new NewEndpoingDialog();
        // this.serviceDialog = new ServiceDialog();
        // this.regionDialog = new RegionDialog();
    }
}
export class ServiceTable extends DataTable {
    constructor() {
        super([
            { title: '名字', key: 'name' },
            { title: '类型', key: 'type' },
            { title: '描述', key: 'description' },
            { title: '启用', key: 'enabled' },
        ], API.service, 'services');
        // this.newItemDialog = new NewEndpoingDialog();
    }
}
export class RegionDataTable extends DataTable {
    constructor() {
        super([
            // { title: 'ID', key: 'id' },
            { title: 'ID', key: 'id' },
            { title: '父Region', key: 'parent_region_id' },
            { title: '描述', key: 'description' },
        ], API.region, 'regions');
    }
}
export class HypervisortTable extends DataTable {
    constructor() {
        super([
            { title: i18n.global.t('hostName'), key: 'hypervisor_hostname', class: 'text-blue' },
            { title: i18n.global.t('memory') + '(MB)', key: 'memory_mb', class: 'text-blue' },
            { title: i18n.global.t('cpu'), key: 'vcpus', class: 'text-blue' },
            { title: i18n.global.t('disk') + '(GB)', key: 'local_gb', class: 'text-blue' },
            { title: i18n.global.t('status'), key: 'status', class: 'text-blue' },
            { title: i18n.global.t('ipAddress'), key: 'host_ip', class: 'text-blue' },
            { title: i18n.global.t('hypervisorType'), key: 'hypervisor_type', class: 'text-blue' },
            { title: i18n.global.t('hypervisorVersion'), key: 'hypervisor_version', class: 'text-blue' },
        ], API.hypervisor, 'hypervisors')
        this.statistics = {};
        this._memUsedPercent = 0;
        this._vcpuUsedPercent = 0;
        this.extendItems = [
            { title: 'numa_node_0_cpuset', key: 'numa_node_0_cpuset' },
            { title: 'numa_node_1_cpuset', key: 'numa_node_1_cpuset' },
            { title: 'numa_node_0_hugepages', key: 'numa_node_0_hugepages' },
            { title: 'numa_node_1_hugepages', key: 'numa_node_1_hugepages' },
            { title: 'extra_resources', key: 'extra_resources' },
            // { title: 'serial_number', key: 'serial_number'},
            // { title: 'cpu_info', key: 'cpu_info'},
        ];
        // this.tenantUsageDialog = new TenantUsageDialog();
        this.users = [];
        this.projects = [];
    }
    async refreshStatics() {
        this.statistics = (await API.hypervisor.statistics()).hypervisor_statistics;
        this._memUsedPercent = (this.statistics.memory_mb_used * 100 / this.statistics.memory_mb).toFixed(2);
        this._vcpuUsedPercent = (this.statistics.vcpus_used * 100 / this.statistics.vcpus).toFixed(2);
        this._diskUsedPercent = (this.statistics.local_gb_used * 100 / this.statistics.local_gb).toFixed(2);
    }

    async refresh() {
        await super.refresh();
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
            { title: '主机名', key: 'name', class: 'blue--text' },
            { title: '服务', key: 'service', class: 'blue--text' },
            { title: '状态', key: 'active', class: 'blue--text' },
            { title: 'available', key: 'available', class: 'blue--text' },
        ], API.az, 'availabilityZoneInfo')
        this.azMap = { internal: { hosts: [] } }
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
        var chartDom = null;
        do {
            chartDom = document.getElementById(eleId);
            console.log(chartDom)
            if (!chartDom) {
                Utils.sleep(0.1)
            }
        } while (!chartDom)

        var myChart = Echarts.init(chartDom);
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
                    emphasis: { focus: 'descendant' },
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
            { title: 'ID', key: 'uuid', class: 'blue--text' },
            { title: '名字', key: 'name', class: 'blue--text' },
            { title: '域', key: 'availability_zone', class: 'blue--text' },
            { title: '节点数量', key: 'host_num', class: 'blue--text' },
        ], API.agg, 'aggregates', '聚合');
        this.extendItems = [
            { title: 'created_at', key: 'created_at' },
            { title: 'updated_at', key: 'updated_at' },
            { title: 'metadata', key: 'metadata' },
            { title: 'hosts', key: 'hosts' },
        ];
    }
    async removeHosts() {
        await this.aggHostsDialog.removeHosts();
        this.refresh()
    }
    async addHosts() {
        await this.aggHostsDialog.addHosts();
        this.refresh();
    }
}
export class ImageDataTable extends DataTable {
    constructor() {
        super([
            { title: '名字', key: 'name' },
            { title: '状态', key: 'status' },
            { title: '大小', key: 'size', align: 'end' },
            { title: '可见性', key: 'visibility' },
            { title: '容器格式', key: 'container_format', align: 'center' },
            { title: '磁盘格式', key: 'disk_format', align: 'center' },
            { title: '操作', key: 'actions', align: 'center' },
        ], API.image, 'images')
        this.extendItems = [
            { title: 'id', key: 'id' },
            { title: 'protected', key: 'protected' },
            { title: 'direct_url', key: 'direct_url' },
            { title: 'container_format', key: 'container_format' },
            { title: 'disk_format', key: 'disk_format' },
            { title: 'created_at', key: 'created_at' },
            { title: 'checksum', key: 'checksum' },
            { title: 'block_device_mapping', key: 'block_device_mapping' },
        ]
        this.KB = 1024;
        this.MB = this.KB * 1024;
        this.GB = this.MB * 1024;
        this.visibility = 'public';
        this.MiniHeaders = [
            { title: 'ID', key: 'id' },
            { title: '名字', key: 'name' },
            { title: '大小', key: 'size', align: 'end' },
        ]
    }
    refresh() {
        let filter = {}
        if (this.visibility) {
            filter.visibility = this.visibility;
        }
        super.refresh(filter)
    }
    humanSize(image) {
        if (!image.size) {
            return '';
        }
        else if (image.size >= this.GB) {
            return `${(image.size / this.GB).toFixed(2)} GB`;
        } else if (image.size >= this.MB) {
            return `${(image.size / this.MB).toFixed(2)} MB`;
        } else if (image.size >= this.KB) {
            return `${(image.size / this.KB).toFixed(2)} KB`;
        } else {
            return `${image.size} B`
        }
    }
}

export class MigrationDataTable extends DataTable {
    constructor(serverId) {
        super([
            { title: 'ID', key: 'id' },
            { title: '类型', key: 'migration_type' },
            { title: '实例ID', key: 'instance_uuid' },
            { title: '源节点', key: 'source_compute' },
            { title: '目的节点', key: 'dest_compute' },
            { title: '开始时间', key: 'created_at' },
            { title: '状态', key: 'status' },
        ], API.migration, 'migrations', '迁移记录');
        this.serverId = serverId;
        this.migrationType = null;
        this.migrationTypes = ['live-migration', 'migration'];
        this.extendItems = [
            { title: '旧规格', key: 'old_instance_type_id' },
            { title: '新规格', key: 'new_instance_type_id' },
            { title: '更新时间', key: 'updated_at' },
            { title: 'dest_host', key: 'dest_host' },
        ]
    }
    refresh(){
        let filters = {}
        if (this.serverId) {
            filters.instance_uuid = this.serverId;
        }
        if (this.migrationType) {
            filters.migration_type = this.migrationType;
        }
        super.refresh(filters)
    }
}

export class Overview {
    constructor() {
        this.statistics = {}
        this.users = []
        this.projects = []
        this.hypervisors = []
        this._memUsedPercent = 0
        this._vcpuUsedPercent = 0
        this._diskUsedPercent = 0

        this.authInfo = {}
        this.user = {}
        this.userRoles = []
        this.refreshing = false;
    }
    percentAvaliableHypervisor() {
        if (!this.statistics.count || this.hypervisors.length <= 0) {
            return 0
        }
        return this.statistics.count * 100 / this.hypervisors.length
    }
    async refreshUseres() {
        this.users = (await API.user.list()).users
    }
    async refreshProjects() {
        this.projects = (await API.project.list()).projects
    }
    async refreshHypervisors() {
        this.hypervisors = (await API.hypervisor.list()).hypervisors
    }
    async refreshStatics() {
        this.statistics = (await API.hypervisor.statistics()).hypervisor_statistics;
        this._memUsedPercent = (this.statistics.memory_mb_used * 100 / this.statistics.memory_mb).toFixed(2);
        this._vcpuUsedPercent = (this.statistics.vcpus_used * 100 / this.statistics.vcpus).toFixed(2);
        this._diskUsedPercent = (this.statistics.local_gb_used * 100 / this.statistics.local_gb).toFixed(2);
    }
    async refresh() {
        this.refreshProjects()
        this.refreshUseres()
        this.refreshStatics()
        this.refreshHypervisors()
    }
    async refreshAndWait() {
        this.refreshing = true
        await this.refreshProjects()
        await this.refreshUseres()
        await this.refreshStatics()
        await this.refreshHypervisors()
        this.refreshing = false
    }
}

export class UserCard {
    constructor() {
        this.authInfo = {}
        this.user = {}
        this.userRoles = []
        this.loading = false
    }
    async refresAuthInfo() {
        this.loading = true
        this.authInfo = await API.authInfo.get()
        this.user = (await API.user.show(this.authInfo.user.id)).user
        let assignments = (await API.roleAssignments.listByUserId(this.user.id))
        this.userRoles = [];
        for (let i in assignments) {
            let role = (await API.role.show(assignments[i].role.id)).role
            this.userRoles.push(role)
        }
        this.loading = false;
    }
    async refresh() {
        this.refresAuthInfo()
    }
}
export class LimitsCard {
    constructor() {
        this.loading = false
        this.computeLimits = {}
        this.vcore = {}
        this.ram = {}
        this.instance = {}
        this.serverGroup = {}

        this.resources = ['instance', 'vcore', 'ram', 'serverGroup']
    }
    percent(resource) {
        if (!this[resource].max || this[resource].max <= 0) {
            return 0
        }
        return this[resource].used * 100 / this[resource].max;

    }
    async refreshComputeLimits() {
        this.computeLimits = (await API.computeLimits.list()).limits
        this.vcore.used = this.computeLimits.absolute.totalCoresUsed
        this.vcore.max = this.computeLimits.absolute.maxTotalCores

        this.ram.used = this.computeLimits.absolute.totalRAMUsed
        this.ram.max = this.computeLimits.absolute.maxTotalRAMSize

        this.instance.used = this.computeLimits.absolute.totalInstancesUsed
        this.instance.max = this.computeLimits.absolute.maxTotalInstances

        this.serverGroup.used = this.computeLimits.absolute.totalServerGroupsUsed
        this.serverGroup.max = this.computeLimits.absolute.maxServerGroups
    }

    async refresh() {
        this.refreshComputeLimits()
    }
}
export class ServerTaskWaiter {
    constructor(server, onUpdatedServer = null) {
        this.server = server
        this.onUpdatedServer = onUpdatedServer
    }
    async updateServer(server) {
        for (var key in server) {
            if (this.server[key] == server[key]) {
                continue
            }
            this.server[key] = server[key]
        }

    }
    async waitServerStatus(expectStatus = ['ACTIVE', 'ERROR']) {
        let expectStatusList = []
        if (typeof expectStatus == 'string') {
            expectStatusList.push(expectStatus.toUpperCase())
        } else {
            expectStatus.forEach(item => {
                expectStatusList.push(item.toUpperCase())
            })
        }
        let oldTaskState = ''
        do {
            let server = await API.server.show(this.server.id);
            this.updateServer(server)
            if (this.onUpdatedServer) {
                this.onUpdatedServer(this.server)
            }
            if (this.server['OS-EXT-STS:task_state'] != oldTaskState) {
                oldTaskState = this.server['OS-EXT-STS:task_state'];
            }
            LOG.debug(`[${this.server.id}] waiting server to be ${expectStatusList}, now: ${this.server.status.toUpperCase()}`)
            if (expectStatusList.indexOf(this.server.status.toUpperCase()) >= 0) {
                break
            }
            await Utils.sleep(5)
        } while (true)
    }
    async waitStopped() {
        let action = 'stop'
        await this.waitServerStatus(['SHUTOFF', 'ERROR'])
        if (this.server.status.toUpperCase() == 'SHUTOFF') {
            Notify.success(`${this.server.name || this.server.id} ${action} 成功`)
        } else {
            Notify.error(`${this.server.name || this.server.id} ${action} 失败`)
        }
    }
    async waitStarted() {
        let action = 'start'
        await this.waitServerStatus()
        if (this.server.status.toUpperCase() == 'ACTIVE') {
            Notify.success(`${this.server.name || this.server.id} ${action} 成功`)
        } else {
            Notify.error(`${this.server.name || this.server.id} ${action} 失败`)
        }
    }
    async waitPaused() {
        let action = 'start'
        await this.waitServerStatus(['PAUSED', 'ERROR'])
        if (this.server.status.toUpperCase() == 'PAUSED') {
            Notify.success(`${this.server.name || this.server.id} ${action} 成功`)
        } else {
            Notify.error(`${this.server.name || this.server.id} ${action} 失败`)
        }
    }
    async waitMigrated() {
        let action = "迁移"
        // TODO: show server first
        let srcHost = this.server['OS-EXT-SRV-ATTR:host'];
        await this.waitServerStatus(['ACTIVE', 'SHUTOFF', 'ERROR'])
        if (this.server['OS-EXT-SRV-ATTR:host'] != srcHost) {
            Notify.success(`${this.server.name || this.server.id} ${action} 成功`)
        } else {
            Notify.error(`${this.server.name || this.server.id} ${action} 失败`)
        }
    }
    async waitRebuilded() {
        let action = "重建"
        // TODO: show server first
        let srcHost = this.server['OS-EXT-SRV-ATTR:host'];
        await this.waitServerStatus(['ACTIVE', 'SHUTOFF', 'ERROR'])
        if (this.server.status != 'ERROR') {
            Notify.success(`${this.server.name || this.server.id} ${action} 成功`)
        } else {
            Notify.error(`${this.server.name || this.server.id} ${action} 失败`)
        }
    }
}

export default DataTable;
