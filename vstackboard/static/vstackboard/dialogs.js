import Dialog from './dialogs/_base.js'
import { Utils, MESSAGE } from './lib.js';
import API from './api.js';

// import { networkTable } from './tables.js';

import { NewFlavorDialog } from "./dialogs/newFlavor.js";
import { NewServerDialog } from "./dialogs/newServer.js";
import { NewVolumeDialog } from "./dialogs/newVolume.js";
import { ChangePasswordDialog } from "./dialogs/changePassword.js";
import { ChangeServerNameDialog } from "./dialogs/changeServerName.js";
import { VolumeAttachDialog } from "./dialogs/volumeAttach.js";
import { VolumeDetachDialog } from "./dialogs/volumeDetach.js";
import { InterfaceAttachDialog } from "./dialogs/interfaceAttach.js";
import { InterfaceDetachDialog } from "./dialogs/interfaceDetach.js";
import { NewEnvDialog } from "./dialogs/newEnv.js";
import { netTable } from './tables.js';

export const newVolume = new NewVolumeDialog()
export const newFlavor = new NewFlavorDialog()
export const changePassword = new ChangePasswordDialog()
export const changeServerName = new ChangeServerNameDialog()
export const volumeAttach = new VolumeAttachDialog()
export const volumeDetach = new VolumeDetachDialog()
export const interfaceDetach = new InterfaceDetachDialog()
export const interfaceAttach = new InterfaceAttachDialog()
export const newServer = new NewServerDialog()

export const newEnv = new NewEnvDialog()


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
        if (this.params.networkType != ''){data['provider:network_type'] = this.params.networkType};
        if (this.params.segId != ''){data['provider:segmentation_id'] = this.params.segId};
        if (this.params.qosPolicy != ''){data.qos_policy = this.params.qosPolicy};
        if (this.params.dnsDomain != ''){data.dns_domain = this.params.dnsDomain};
        if (this.params.azHint != ''){data.availability_zone_hints = [this.params.azHint]};

        API.network.post({network: data}).then(resp => {
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
    randomName(){
        this.params.name =  Utils.getRandomName('subnet');
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
        if (this.params.gateway != ''){data.gateway = this.params.gateway };

        API.subnet.post({subnet: data}).then(resp => {
            MESSAGE.success(`子网 ${this.params.name} 创建成功`)
            netTable.refresh();
            netTable.refreshSubnets();
        }).catch(error => {
            MESSAGE.error(`子网 ${this.params.name} 创建失败, ${error.response.data.NeutronError.message}`)
        });
        this.hide()
    }
}


export const newNetDialog = new NewNetworkDialog()
export const newSubnetDialog = new NewSubnetDialog()
