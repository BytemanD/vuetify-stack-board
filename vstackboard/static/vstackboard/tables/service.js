import DataTable from "./_base.js";
import API from "../api.js";

class ServiceTable extends DataTable {
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
                MESSAGE.success(`${service.host}:${service.binary} 已设置强制down`)
            } else {
                MESSAGE.success(`${service.host}:${service.binary} 已取消强制down`)
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
            api.computeService.disable(service.id).then(resp => {
                MESSAGE.success(`${service.host}:${service.binary} 已设置为不可用`)
            }).catch(error => {
                MESSAGE.error(`${service.host}:${service.binary} 设置不可用失败`)
                service.status = 'enabled';
            });
        } else {
            service.status = 'enabled';
            api.computeService.enable(service.id).then(resp => {
                MESSAGE.success(`${service.host}:${service.binary} 已设置为可用`)
            }).catch(error => {
                MESSAGE.error(`${service.host}:${service.binary} 设置可用失败`)
                service.status = 'enabled';
            });
        }
    }
}

export default ServiceTable;