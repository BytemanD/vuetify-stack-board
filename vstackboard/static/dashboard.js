import { Utils } from "./vstackboard/lib.js";
import API from "./vstackboard/api.js";
// import * as echarts from 'echarts';
// import { TreeChart } from 'echarts/charts';
// echarts.use([TreeChart]);

import DataTable, {
    volumeTable, serviceTable, serverTable, flavorTable, usageTable,
    backupTable, clusterTable, keypairTable, volumeServiceTable,
    routerTable, netTable, portTable, volumeTypeTable, snapshotTable,
    hypervisorTable,
    azTable,
    regionTable
} from "./vstackboard/tables.js";
import {
    newFlavor, flavorExtraDialog,
    newServer,
    changePassword, changeServerName, serverVolumeDialog, serverInterfaceDialog,
    resizeDialog, migrateDialog, newKeypairDialog, rebuildDialog,
    newVolume, newSnapshotDialog, newBackupDialog,
    newRouterDialog, newNetDialog, newSubnetDialog, routerInterfacesDialog,
    newPortDialog, serverTopology, serverActions, newVolumeTypeDialog

} from "./vstackboard/dialogs.js";


const navigationItems = [
    { title: '虚拟化资源', icon: 'mdi-alpha-h-circle' },
    { title: '实例', icon: 'mdi-laptop-account', group: '计算资源' },
    { title: '计算管理', icon: 'mdi-react', },
    // { title: '规格', icon: 'mdi-alpha-f-circle', },
    // { title: '计算服务', icon: 'mdi-server' },
    // { title: '密钥对', icon: 'mdi-key-chain', },
    { title: '存储', icon: 'mdi-storage-tank' },
    { title: '镜像', icon: 'mdi-package-variant-closed' },

    { title: '网络', icon: 'mdi-web', group: '网络资源' },
    { title: '服务', icon: 'mdi-server', group: '认证' },
    { title: '用户', icon: 'mdi-account-supervisor' },

]

new Vue({
    el: '#app',
    delimiters: ['[[', ']]'],
    vuetify: new Vuetify(),
    data: {
        UTILS: Utils,
        clusterTable: clusterTable,
        regionTable: regionTable,
        identity: {
            showAllService: false,
            serviceMap: {},
            users: {},
            projectMap: {},
            endpointTable: new DataTable([
                { text: 'serviceName', value: 'service_name' },
                { text: 'serviceType', value: 'service_type' },
                { text: 'interface', value: 'interface' },
                { text: 'url', value: 'url' },
                { text: 'region', value: 'region' }
            ], API.endpoint, 'endpoints'),
            userTable: new DataTable([{ text: 'id', value: 'id' },
            { text: 'name', value: 'name' },
            { text: 'project_id', value: 'project_id' }
            ], API.user, 'users')
        },
        computing: {
            tab: 0,
            serverTable: serverTable,
            flavorTable: flavorTable,
            hypervisorTable: hypervisorTable,
            serviceTable: serviceTable,
            usageTable: usageTable,
            keypairTable: keypairTable,
            azTable: azTable,
            serverTopology: serverTopology,
            serverActions: serverActions,
        },
        image: {
            imageTable: new DataTable([
                { text: 'name', value: 'name' },
                { text: 'status', value: 'status' },
                { text: 'size', value: 'size' },
                { text: 'visibility', value: 'visibility' },
                { text: 'image_state', value: 'image_state' },
                { text: 'image_type', value: 'image_type' },
            ], API.image, 'images'),
        },
        networking: {
            tab: 0,
            routerTable: routerTable,
            networkTable: netTable,
            portTable: portTable,
        },
        volume: {
            tab: 0,
            volumeTable: volumeTable,
            volumeTypeTable: volumeTypeTable,
            snapshotTable: snapshotTable,
            backupTable: backupTable,
            volumeServiceTable: volumeServiceTable,
        },
        navigation: {
            item: $cookies.get('navigationItem') || 0,
            items: navigationItems,
        },
        drawer: '',
        miniVariant: false,
        newVolumeDialog: newVolume,
        newSnapshotDialog: newSnapshotDialog,
        newBackupDialog: newBackupDialog,
        newVolumeTypeDialog: newVolumeTypeDialog,
        // server dialogs
        newFlavorDialog: newFlavor,
        flavorExtraDialog: flavorExtraDialog,
        newServerDialog: newServer,
        changePasswordDialog: changePassword,
        changeServerNameDialog: changeServerName,
        serverVolumeDialog: serverVolumeDialog,
        serverInterfaceDialog: serverInterfaceDialog,
        resizeDialog: resizeDialog,
        migrateDialog: migrateDialog,
        rebuildDialog: rebuildDialog,
        newKeypairDialog: newKeypairDialog,
        // network dialogs
        newNetDialog: newNetDialog,
        newRouterDialog: newRouterDialog,
        newSubnetDialog: newSubnetDialog,
        routerInterfacesDialog: routerInterfacesDialog,
        newPortDialog: newPortDialog,
    },
    methods: {
        getServices: async function () {
            let body = await API.service.list()
            body.services.forEach(item => {
                this.identity.serviceMap[item.id] = item
            });
        },
        loginVnc: async function (server) {
            let body = await API.server.getVncConsole(server.id);
            window.open(body.remote_console.url, '_blank');
        },
        refreshContainer: function () {
            if (this.navigation.item >= this.navigation.items.length) {
                this.navigation.item = 0;
            }
            switch (this.navigation.items[this.navigation.item].title) {
                case '服务':
                    this.getServices();
                    this.identity.endpointTable.refresh();
                    break;
                case '用户':
                    this.identity.userTable.refresh();
                    break;
                case '实例':
                    this.computing.serverTable.refresh();
                    break;
                case '计算管理':
                    this.computing.flavorTable.refresh();
                    this.computing.flavorTable.refreshExtraSpecs();
                    this.computing.keypairTable.refresh();
                    this.computing.serviceTable.refresh();
                    this.computing.azTable.refresh();
                    break;
                case '虚拟化资源':
                    this.computing.hypervisorTable.refresh();
                    this.computing.hypervisorTable.refreshStatics();
                    this.computing.usageTable.refresh();
                    break;
                case '计算服务':
                    this.computing.serviceTable.refresh();
                    break;
                case '密钥对':

                    break;
                case '网络':
                    this.networking.networkTable.refresh();
                    this.networking.networkTable.refreshSubnets();
                    this.networking.portTable.refresh();
                    this.networking.routerTable.refresh();
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
                    this.volume.snapshotTable.refresh();
                    this.image.imageTable.refresh();
                    this.volume.backupTable.refresh();
                    this.volume.volumeServiceTable.refresh();
                    break;
            }
        },
        getMessageTop: function (index) {
            return `top: ${50 * index}px`;
        },
        changeCluster: function (item) {
            $cookies.set('clusterId', item.id);
            $cookies.set('clusterName', item.name);
            window.open('/dashboard', '_self');
        },
        useCluster: function () {
            let cluster = this.clusterTable.getSelectedCluster()
            console.debug(cluster);
            $cookies.set('clusterId', cluster.id);
            $cookies.set('clusterName', cluster.name);
            window.open('/dashboard', '_self');
        },
        useRegion: function(){
            $cookies.set('region', this.regionTable.selected);
            window.open('/dashboard', '_self');
        },
        drawAz() {
            this.computing.azTable.drawTopoloy('az');
        },

    },
    mounted: function () {
        // this.drawAz();
    },
    created: async function () {
        this.clusterTable.selected = $cookies.get('clusterName');
        this.clusterTable.refresh();

        this.regionTable.selected = $cookies.get('region');
        this.regionTable.refresh();

        this.refreshContainer()
        document.getElementById('loader').remove();
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
                if (newValue != '') {
                    this.newVolumeDialog.params.snapshot = '';
                }
            }
        },
        "newVolumeDialog.params.snapshot": {
            handler(newValue, oldValue) {
                if (newValue != '') {
                    this.newVolumeDialog.params.image = '';
                    this.newVolumeDialog.params.type = '';
                }
            }
        }
    }
});
