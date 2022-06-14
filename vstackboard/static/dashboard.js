import { Message, Utils } from "./vstackboard/lib.js";
import DataTable from "./vstackboard/tables/_base.js";

import { volumeTable, serviceTable, serverTable, flavorTable, usageTable, routerTable, netTable, portTable }  from "./vstackboard/tables.js";

import { newFlavor, newServer, changePassword, changeServerName, newVolume, newNetDialog, newSubnetDialog } from "./vstackboard/dialogs.js";
import { volumeAttach, volumeDetach, interfaceDetach, interfaceAttach } from "./vstackboard/dialogs.js";
import API from "./vstackboard/api.js";

const MESSAGE = new Message()
const navigationItems = [
    { title: '虚拟化资源', icon: 'mdi-alpha-h-circle'},
    { title: '实例', icon: 'mdi-laptop-account', group: 'compute' },
    { title: '规格', icon: 'mdi-alpha-f-circle', },
    { title: '计算服务', icon: 'mdi-server' },
    { title: '存储', icon: 'mdi-storage-tank' },
    { title: '镜像', icon: 'mdi-alpha-i-circle' },

    { title: '服务', icon: 'mdi-server', group: 'identity' },
    { title: '用户', icon: 'mdi-account-supervisor' },

    { title: '网络', icon: 'mdi-network', group: 'network' },
    { title: '端口', icon: 'mdi-ethernet' },
    { title: '路由', icon: 'mdi-router' },
]


new Vue({
    el: '#app',
    delimiters: ['[[', ']]'],
    vuetify: new Vuetify(),
    data: {
        tabs: 0,
        UTILS: Utils,
        api: API,
        messages: [],
        identity: {
            showAllService: false,
            serviceMap: {},
            users: {},
            projectMap: {},
            endpointTable: new DataTable([{ text: 'serviceName', value: 'service_name' },
            { text: 'serviceType', value: 'service_type' },
            { text: 'interface', value: 'interface' },
            { text: 'url', value: 'url' }
            ], API.endpoint, 'endpoints'),
            userTable: new DataTable([{ text: 'id', value: 'id' },
            { text: 'name', value: 'name' },
            { text: 'project_id', value: 'project_id' }
            ], API.user, 'users')
        },
        computing: {
            serverTable: serverTable,
            flavorTable: flavorTable,
            hypervisorTable: new DataTable([{ text: '主机名', value: 'hypervisor_hostname', class: 'blue--text' },
                                            { text: 'IP', value: 'host_ip', class: 'blue--text' },
                                            { text: '状态', value: 'status', class: 'blue--text' },
                                            { text: '总内存', value: 'memory_mb', class: 'blue--text' },
                                            { text: '已用内存', value: 'memory_mb_used', class: 'blue--text' },
                                            { text: 'CPU', value: 'vcpus', class: 'blue--text' },
                                            { text: '已用CPU', value: 'vcpus_used', class: 'blue--text' },
                                            { text: '虚拟化版本', value: 'hypervisor_version', class: 'blue--text' },
                                            ], API.hypervisor, 'hypervisors'),
            serviceTable: serviceTable,
            usageTable: usageTable,
        },
        image: {
            imageTable: new DataTable([{ text: 'name', value: 'name' },
            { text: 'status', value: 'status' },
            { text: 'size', value: 'size' },
            { text: 'visibility', value: 'visibility' },
            { text: 'image_state', value: 'image_state' },
            { text: 'image_type', value: 'image_type' },
            ], API.image, 'images'),
        },
        networking: {
            routerTable: routerTable,
            networkTable: netTable,
            portTable: portTable,
        },
        volume: {
            volumeTable: volumeTable,
            volumeTypeTable: new DataTable([{ text: '名字', value: 'name' },
                                            { text: '是否公共', value: 'is_public' },
                                            { text: '属性', value: 'extra_specs' },
                                            ], API.volumeType, 'volume_types'),
            snapshotTable: new DataTable([{ text: '名字', value: 'name' },
                                            { text: '状态', value: 'status' },
                                            { text: '大小', value: 'size' },
                                            { text: '卷ID', value: 'volume_id' },
                                            ], API.snapshot, 'snapshots', '快照'),
        },
        navigation: {
            item: $cookies.get('navigationItem') || 0,
            items: navigationItems,
        },
        drawer: '',
        miniVariant: false,
        newVolumeDialog: newVolume,
        newFlavorDialog: newFlavor,
        changePasswordDialog: changePassword,
        changeServerNameDialog: changeServerName,
        volumeAttachDialog: volumeAttach,
        volumeDetachDialog: volumeDetach,
        interfaceDetachDialog: interfaceDetach,
        interfaceAttachDialog: interfaceAttach,
        newServerDialog: newServer,
        newNetDialog: newNetDialog,
        newSubnetDialog: newSubnetDialog,
    },
    methods: {
        getServices: function () {
            let self = this;
            API.service.list().then(resp => {
                resp.data.services.forEach(item => {
                    self.identity.serviceMap[item.id] = item
                });
            });
        },
        networkDelete: function () {
            let self = this;
            self.networking.networkTable.selected.forEach(item => {
                API.network.delete(item).then(resp => {
                    console.log(`delete network ${item.id} success`);
                });
            });
            self.networking.networkTable.refresh();
        },
        loginVnc: function (server) {
            API.server.getVncConsole(server.id).then(resp => {
                if (resp.data.remote_console.url) {
                    window.open(resp.data.remote_console.url, '_blank');
                } else {
                    console.error(`get console url failed, response: ${resp.data}`)
                }
            });
        },
        checkVolumeStatus: function (volume_id) {
            let self = this;
            API.volume.show(volume_id).then(resp => {
                let status = resp.data.volume.status;
                if (status == 'available') {
                    MESSAGE.success(`卷 ${volume_id} 创建成功`);
                    self.volume.volumeTable.refresh()
                    return;
                } else if (status == 'error') {
                    MESSAGE.error(`卷 ${volume_id} 创建失败`);
                    self.volume.volumeTable.refresh();
                    return;
                };
                setTimeout(function () {
                    self.checkVolumeStatus(volume_id)
                }, 5 * 1000)
            });
        },
        newVolume: function (params) {
            let self = this;
            for (var i=1; i <= params.nums; i++) {
                let data = {
                    name: params.nums > 1 ? `${params.name}-${i}` : params.name,
                    size: parseInt(params.size)
                };
                if (params.image != '') { data.imageRef = params.image; }
                if (params.type != '') { data.volume_type = params.type; }
                API.volume.create(data).then(resp => {
                    self.volume.volumeTable.refresh();
                    self.checkVolumeStatus(resp.data.volume.id);
                })
            }
            MESSAGE.info(`卷 ${params.name} 创建中`);
            this.newVolumeDialog.show = false;
        },
        checkServerStatus: function (server_id) {
            let self = this;
            API.server.show(server_id).then(resp => {
                let status = resp.data.server.status;
                switch (status.toUpperCase()) {
                    case 'ACTIVE':
                        MESSAGE.success(`实例 ${server_id} 创建成功`);
                        self.computing.serverTable.refresh();
                        break;
                    case 'ERROR':
                        MESSAGE.error(`实例 ${volume_id} 创建失败`);
                        self.computing.serverTable.refresh();
                        break;
                    default:
                        setTimeout(function () {
                            self.checkServerStatus(server_id)
                        }, 5 * 1000);
                        break;
                }
            });
        },
        refreshContainer: function () {
            switch (this.navigation.items[this.navigation.item].title) {
                case '服务':
                    this.getServices();
                    this.identity.endpointTable.refresh();
                    break;
                case '用户':
                    this.identity.userTable.refresh();
                    break;
                case '规格':
                    this.computing.flavorTable.refresh();
                    this.computing.flavorTable.refreshExtraSpecs();
                    break;
                case '实例':
                    this.computing.serverTable.refresh();
                    break;
                case '虚拟化资源':
                    this.computing.hypervisorTable.refresh();
                    this.hyperStatistics();
                    this.computing.usageTable.refresh();
                    break;
                case '计算服务':
                    this.computing.serviceTable.refresh();
                    break;
                case '网络':
                    this.networking.networkTable.refresh();
                    this.networking.networkTable.refreshSubnets();
                case '端口':
                    this.networking.portTable.refresh();
                    break;
                case '路由':
                    this.networking.routerTable.refresh();
                    break;
                case '镜像':
                    this.image.imageTable.refresh();
                    break;
                case '存储':
                    this.volume.volumeTable.refresh();
                    this.volume.volumeTypeTable.refresh();
                    this.volume.snapshotTable.refresh()
                    this.image.imageTable.refresh();
                    break;
            }
        },
        hyperStatistics: function () {
            let self = this;
            API.hypervisor.statistics().then(resp => {
                self.computing.hypervisorTable.statistics = resp.data.hypervisor_statistics;
            })
        },
        getMessageTop: function (index) {
            return `top: ${50 * index}px`;
        },
    },
    created: function () {
        let self = this;
        // init
        // this.navigation.item =  this.$cookies.get('navigationItem') || 0;
        this.refreshContainer()
        // setInterval(function(){
        //     self.getServers();
        // }, 5 * 1000);

        // setInterval(function(){
        //     self.hypersorList();
        // }, 5 * 1000);

    },
    watch: {
        'navigation.item': {
            handler(newValue, oldValue) {
                if (typeof (oldValue) != 'undefined') {
                    this.$cookies.set('navigationItem', newValue);
                }
                this.refreshContainer();
            },
        },

        "newVolumeDialog.params.image": {
            handler(newValue, oldValue) {
                if (newValue != ''){
                    this.newVolumeDialog.params.snapshot = '';
                }
            }
        },
        "newVolumeDialog.params.snapshot": {
            handler(newValue, oldValue) {
                if (newValue != ''){
                    this.newVolumeDialog.params.image = '';
                    this.newVolumeDialog.params.type = '';
                }
            }
        }
    }
});
