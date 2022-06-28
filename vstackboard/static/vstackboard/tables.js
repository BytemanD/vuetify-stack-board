import API from './api.js'
import { ALERT, Alert, MESSAGE } from './lib.js'

class DataTable {
    constructor(headers, api, bodyKey = null, name='') {
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
    }
    deleteSelected() {
        let self = this;
        if (this.selected.length == 0){
            return;
        }
        MESSAGE.info(`${this.name} 删除中`)
        this.selected.forEach(item => {
            self.api.delete(item.id).then(resp => {
                self.checkDeleted(item.id);
            });
        });
        this.refresh();
        this.resetSelected();
    }
    checkDeleted(id) {
        let self = this;
        this.api.list({ id: id }).then(resp => {
            if (resp.data[self.bodyKey].length >= 1) {
                setTimeout(function () {
                    self.checkDeleted(id)
                }, 5 * 1000)
            } else {
                MESSAGE.success(`${self.name} ${id} 删除成功`, 2);
                self.refresh();
            }
        });
    }
    resetSelected() {
        this.selected = [];
    }
    updateItem(newItem){
        for(var i=0; i < this.items.length; i++) {
            if (this.items[i].id != newItem.id){
                continue;
            }
            for (var key in newItem){
                this.items[i][key] = newItem[key];
            }
            break
        }
    }
    refresh(filters={}) {
        let result = null
        if (this.api.detail) {
            result = this.api.detail(filters);
        } else {
            result = this.api.list(filters)
        }
        result.then(resp => {
            this.items = this.bodyKey ? resp.data[this.bodyKey] : resp.data;
        })
        return result;
    };
}


export class RouterDataTable extends DataTable{
    constructor(){
        super([
            { text: 'name', value: 'name' },
            { text: 'status', value: 'status' },
            { text: 'admin_state_up', value: 'admin_state_up' },
            { text: 'routes', value: 'routes' },
        ], API.router, 'routers')
    }
    adminStateDown(item){
        API.router.put(item.id, {router: {admin_state_up: item.admin_state_up}}).then(resp => {
            if (item.admin_state_up){
                MESSAGE.success(`路由 ${item.name} 已设置为 UP`)
            } else {
                MESSAGE.success(`路由 ${item.name} 已设置为 DOWN`)
            }
        })
    }
    listPorts(item){
        API.router.listInterface(item.id).then(resp => {
            
        })

    }
}

export class NetDataTable extends DataTable{
    constructor(){
        super([
            { text: '名字', value: 'name' },
            { text: '状态', value: 'status' },
            { text: 'admin_state_up', value: 'admin_state_up' },
            { text: '共享', value: 'shared' },
            { text: '网络类型', value: 'provider:network_type' },
            { text: 'MTU', value: 'mtu' },
            { text: '子网', value: 'subnets' },
        ], API.network, 'networks', '网络')
        this.subnets = {};
    }
    refreshSubnets(){
        API.subnet.list().then(resp => {
            resp.data.subnets.forEach(item => {
                Vue.set(this.subnets, item.id, item)
            })
        });
    }
    deleteSubnet(subnet_id){
        let subnet = this.subnets[subnet_id];
        API.subnet.delete(subnet_id).then(resp => {
            MESSAGE.success(`子网 ${subnet.cidr} 删除成功`)
            netTable.refresh();
        }).catch(error => {
            MESSAGE.error(`子网 ${subnet.cidr} 删除失败， ${error.response.data.NeutronError.message}`)
        }) ;
    }
    adminStateDown(item){
        API.network.put(item.id, {network: {admin_state_up: item.admin_state_up}}).then(resp => {
            if (item.admin_state_up){
                MESSAGE.success(`网络 ${item.name} 已设置为 UP`)
            } else {
                MESSAGE.success(`网络 ${item.name} 已设置为 down`)
            }
        })
    }
    shared(item){
        API.network.put(item.id, {network: {shared: item.shared}}).then(resp => {
            if (item.shared){
                MESSAGE.success(`网络 ${item.name} 已设置为共享`)
            } else {
                MESSAGE.success(`网络 ${item.name} 已取消共享`)
            }
        })
    }
}
export class PortDataTable extends DataTable{
    constructor(){
        super([{ text: 'id', value: 'id' },
               { text: 'name', value: 'name' },
               { text: 'status', value: 'status' },
               { text: 'admin_state_up', value: 'admin_state_up' },
               { text: 'device_owner', value: 'device_owner' },
               { text: 'fixed_ips', value: 'fixed_ips' },
        ], API.port, 'ports');

        this.extendItems = [
            {text: 'binding:vnic_type', value: 'binding:vnic_type' },
            {text: 'binding:vif_type', value: 'binding:vif_type' },
            {text: 'binding:vif_details', value: 'binding:vif_details' },
            {text: 'binding:profile', value: 'binding:profile' },
            {text: 'binding:host_id', value: 'binding:host_id' },
            {text: 'network_id', value: 'network_id' },
            {text: 'device_id', value: 'device_id' },
            {text: 'mac_address', value: 'mac_address' },
            {text: 'qos_policy_id', value: 'qos_policy_id' },
            {text: 'description', value: 'description' },
        ];
    }
    adminStateDown(item){
        API.port.put(item.id, {port: {admin_state_up: item.admin_state_up}}).then(resp => {
            if (item.admin_state_up){
                MESSAGE.success(`端口 ${item.name || item.id} 已设置为 UP`)
            } else {
                MESSAGE.success(`端口 ${item.name || item.id} 已设置为 DOWN`)
            }
        }).catch(error => {
            MESSAGE.error(`端口 ${item.name} 更新失败`)
            item.admin_state_up = ! item.admin_state_up;
        })
    }
}
export class FlavorDataTable extends DataTable {
    constructor() {
        super([{ text: 'ID', value: 'id'},
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
    checkDeleted(id) {
        MESSAGE.success(`规格 ${id} 删除成功`);
    }
    refreshExtraSpecs(){
        this.items.forEach(item => {
            if (Object.keys(this.extraSpecsMap).indexOf(item.id) > 0){
                return;
            }
            API.flavor.getExtraSpecs(item.id).then(resp => {
                Vue.set(this.extraSpecsMap, item.id, resp.data.extra_specs)
            })
        })
    }
    refresh(){
        return super.refresh({is_public: this.isPublic}).then(resp => {
            this.refreshExtraSpecs()
        })
    }
}
export class KeypairDataTable extends DataTable {
    constructor() {
        super([{ text: '名字', value: 'name' },
               { text: '类型', value: 'type' },
               { text: 'fingerprint', value: 'fingerprint' }
              ], API.keypair, 'keypairs', '密钥对');
        // this.extendItems = [
        //     { text: '公钥', value: 'public_key' },
        // ]
    }
    copyPublicKey(item){
        navigator.clipboard.writeText(item.public_key);
        MESSAGE.success(`公钥内容已复制`);
    }
    deleteSelected(){
        let self = this;
        if (this.selected.length == 0){return;}
        this.selected.forEach(item => {
            self.api.delete(item.name).then(resp => {
                MESSAGE.success(`密钥对 ${item.name} 删除成功`)
                this.refresh();
            }).catch(error => {
                MESSAGE.error(`密钥对 ${item.name} 删除失败`)
            });
        });
        this.resetSelected();
    }
    refresh(filters={}) {
        let result = null
        if (this.api.detail) {
            result = this.api.detail(filters);
        } else {
            result = this.api.list(filters)
        }
        result.then(resp => {
            this.items = [];
            resp.data.keypairs.forEach(item => {
                let data = item.keypair;
                // data.id = item.keypair.name;
                this.items.push(item.keypair);
            })
        })
        return result;
    };

}
export class ServerDataTable extends DataTable {
    constructor() {
        super([{ text: '名字', value: 'name' },
               { text: '宿主机', value: 'OS-EXT-SRV-ATTR:host' },
               { text: '状态/任务', value: 'status' },
               { text: '电源状态', value: 'power_state' },
               { text: '规格', value: 'flavor' },
               { text: '镜像', value: 'image' },
               { text: 'IP地址', value: 'addresses' },
               { text: '操作', value: 'action' },
            ],
            API.server, 'servers', '实例');
        this.imageMap = {}
    }

    waitServerActive(server, expectStatus='ACTIVE'){
        let self = this;
        return new Promise(function(resolve, reject){
            API.server.show(server.id).then(resp => {
                let currentServer = resp.data.server;
                if (currentServer['OS-EXT-STS:task_state'] != server['OS-EXT-STS:task_state']){
                    self.updateItem(currentServer);
                }
                switch (currentServer.status.toUpperCase()){
                    case expectStatus.toUpperCase():
                        self.updateItem(currentServer);
                        resolve(currentServer);
                        break
                        case 'ERROR':
                        self.updateItem(currentServer);
                        reject(currentServer);
                        break;
                    default:
                        setTimeout(function(){
                            self.waitServerActive(server, expectStatus).then(data => {
                                resolve(data)
                            }).catch(data => {
                                reject(data)
                            })
                        }, 3 * 1000)
                        break;
                }
            })
        })
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
            if (item.status.toUpperCase() != 'ACTIVE'){
                ALERT.warn(`虚拟机 ${item.name} 不是运行状态`)
                return;
            }
            self.api.stop(item.id).then(resp => {
                self.waitServerActive(item, 'SHUTOFF').then(resp => {
                    MESSAGE.success(`虚拟机 ${item.name}已关机`)
                })
            });
        });
    }
    startSelected() {
        let self = this;
        this.selected.forEach(item => {
            if (item.status.toUpperCase() != 'SHUTOFF'){
                ALERT.warn(`虚拟机 ${item.name} 不是关机状态`)
                return;
            }
            self.api.start(item.id).then(resp => {
                self.waitServerActive(item, 'ACTIVE').then(resp => {
                    MESSAGE.success(`虚拟机 ${item.name}已开机`)
                })
            });
        });
    }
    pauseSelected(){
        let self = this;
        this.selected.forEach(item => {
            if (item.status.toUpperCase() != 'ACTIVE'){
                ALERT.warn(`虚拟机 ${item.name} 不是运行状态`)
                return;
            }
            self.api.pause(item.id).then(resp => {
                self.waitServerActive(item, 'PAUSED').then(resp => {
                    MESSAGE.success(`虚拟机 ${item.name}已暂停`)
                })
            });
        });
    }
    unpauseSelected(){
        let self = this;
        this.selected.forEach(item => {
            if (item.status.toUpperCase() != 'PAUSED'){
                ALERT.warn(`虚拟机 ${item.name} 不是暂停状态`)
                return;
            }
            self.api.unpause(item.id).then(resp => {
                self.waitServerActive(item, 'ACTIVE').then(resp => {
                    MESSAGE.success(`虚拟机 ${item.name}已开启`)
                })
            });
        });
    }
    rebootSelected(type = 'SOFT') {
        let self = this;
        this.selected.forEach(item => {
            if (item.status.toUpperCase() != 'ACTIVE'){
                ALERT.warn(`虚拟机 ${item.name} 不是运行状态`)
                return;
            }
            self.api.reboot(item.id, type).then(resp => {
                self.waitServerActive(item, 'ACTIVE').then(resp => {
                    MESSAGE.success(`虚拟机 ${item.name}已重启`)
                })
            });
        });
        this.refresh();
        this.resetSelected();
    }

    getImage(server) {
        let imageId = server.image.id;
        if (!imageId) { return }
        if (Object.keys(this.imageMap).indexOf(imageId) < 0) {
            Vue.set(this.imageMap, imageId, {})
        }
        if (!this.imageMap[imageId].name) {
            API.image.show(imageId).then(resp => {
                this.imageMap[imageId] = resp.data;
            })
        }
        return this.imageMap[imageId];
    }
}
export class ServiceTable extends DataTable {
    constructor() {
        super([{ text: '服务', value: 'binary' },
               { text: '主机', value: 'host' },
               { text: 'zone', value: 'zone' },
               { text: '可用状态', value: 'status' },
               { text: '服务状态', value: 'state' },
               { text: '强制down', value: 'forced_down'},
              ], API.computeService, 'services')
    }
    forceDown(service) {
        let down = service.forced_down;
        API.computeService.forceDown(service.id, down).then(resp => {
            if (down){
                MESSAGE.success(`${service.host}:${service.binary} 已强制设为 Down`)
            } else {
                MESSAGE.success(`${service.host}:${service.binary} 已取消强制 Down`)
            }
        }).catch(error => {
            MESSAGE.error(`${service.host}:${service.binary} 设置强制down失败`)
            service.forced_down = !down;
        });
    }
    enable(service){
        let status = service.status;
        if (status == 'enabled'){
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

export class UsageTable extends DataTable{
    constructor(){
        super([{ text: '租户ID', value: 'tenant_id' },
               { text: '总内存使用', value: 'total_memory_mb_usage' },
               { text: '总cpu使用', value: 'total_vcpus_usage' },
            //    { text: '实例使用', value: 'server_usages' },
              ], API.usage, 'tenant_usages', 'Usage');
        this.start = '';
        this.end = ''
    }
    refresh(){
        // console.log(this.start, this.end)
        let params = {detailed: 1};
        if (this.start != this.end) {
            if (this.start){
                params.start = `${this.start}T00:00:00.0`;
            }
            if (this.end){
                params.end = `${this.end}T00:00:00.0`;
            }
        }
        // super.refresh({start: this.start, end: this.end})
        super.refresh(params);
    }
}
export class VolumeDataTable extends DataTable{
    constructor() {
        super([{ text: '名字', value: 'name' },
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
              ], API.volumeType, 'volume_types')
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
}

export class ClusterTable extends DataTable {
    constructor() {
        super([], API.cluster, 'clusters', '集群');
        this.selected = null;
    }
    delete(item){
        API.cluster.delete(item.id).then(resp => {
            MESSAGE.success(`集群 ${item.name} 删除成功`);
            this.refresh();
        }).catch(error => {
            MESSAGE.error(`集群 ${item.name} 删除失败`);
        })
    }
}
export const volumeTable = new VolumeDataTable();
export const volumeTypeTable = new VolumeTypeTable();
export const snapshotTable = new SnapshotTable();
export const flavorTable = new FlavorDataTable();
export const keypairTable = new KeypairDataTable();;
export const serverTable = new ServerDataTable();
export const usageTable = new UsageTable();

export const serviceTable = new ServiceTable();
export const routerTable = new RouterDataTable();
export const netTable = new NetDataTable();
export const portTable = new PortDataTable();

export const clusterTable = new ClusterTable();

export default DataTable;
