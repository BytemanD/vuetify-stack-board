import DataTable from './tables/_base.js'
import API from './api.js'
import { MESSAGE } from './lib.js'
import VolumeDataTable from './tables/volume.js'
import FlavorDataTable from './tables/flavor.js'
import ServerDataTable from './tables/server.js'
import ServiceTable from './tables/service.js'
import UsageTable from './tables/usage.js'


export class RouterDataTable extends DataTable{
    constructor(){
        super([
            { text: 'name', value: 'name' },
            { text: 'name', value: 'name' },
            { text: 'status', value: 'status' },
            { text: 'routes', value: 'routes' },
        ], API.router, 'routers' )
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
        ], API.port, 'ports')
    }
}

export const volumeTable = new VolumeDataTable();
export const flavorTable = new FlavorDataTable();
export const serverTable = new ServerDataTable();
export const serviceTable = new ServiceTable();
export const usageTable = new UsageTable();

export const routerTable = new RouterDataTable();
export const netTable = new NetDataTable();
export const portTable = new PortDataTable();
