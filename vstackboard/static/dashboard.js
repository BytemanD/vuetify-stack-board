import { ALERT, MESSAGE, Utils } from "./vstackboard/lib.js";
import API from "./vstackboard/api.js";
// import * as echarts from 'echarts';
// import { TreeChart } from 'echarts/charts';
// echarts.use([TreeChart]);

import {
    volumeTable, serviceTable, serverTable, flavorTable, usageTable,
    backupTable, clusterTable, keypairTable, volumeComputeServiceTable,
    routerTable, netTable, portTable, volumeTypeTable, snapshotTable,
    hypervisorTable, azTable, regionTable, qosPolicyTable,
    imageTable, sgTable, userTable, projectTable, domainTable, aggTable,
    migrationTable,
    endpointTable,
} from "./vstackboard/objects.js";
import {
    newFlavor, flavorExtraDialog,
    newServer,
    changePassword, changeServerName, serverVolumeDialog, serverInterfaceDialog,
    resizeDialog, migrateDialog, newKeypairDialog, rebuildDialog, evacuateDialog,
    newVolume, newSnapshotDialog, newBackupDialog, backupResetStateDialog,
    newRouterDialog, newNetDialog, newSubnetDialog, routerInterfacesDialog,
    newPortDialog, serverTopology, serverActions, newVolumeTypeDialog, serverActionEvents,
    newQosPolicyDialog, imageDeleteSmartDialog, volumeResetStateDialog, snapshotResetStateDialog,
    sgRulesDialog, newSGDialog, newSGRuleDialog, imagePropertiesDialog,
    qosPolicyRulesDialog, newQosPolicyRule, updateServerSG, serverConsoleLog, updatePortDialog,
    projectUserDialog, newUserDialog, rolesDialog, newRoleDialog
} from "./vstackboard/objects.js";
import { init } from "./vstackboard/context.js";
import DataTable from "./vstackboard/tables.js";
import { SETTINGS } from "./vstackboard/settings.js";
import { I18N } from "./i18n.js";


const navigationItems = [
    { title: '虚拟化资源', icon: 'mdi-alpha-h-circle' },
    { title: '实例', icon: 'mdi-laptop-account', group: '计算' },
    { title: '计算管理', icon: 'mdi-layers', },
    { title: '存储', icon: 'mdi-expansion-card' },
    { title: '镜像', icon: 'mdi-package-variant-closed' },

    { title: '网络资源', icon: 'mdi-web', group: '网络' },
    { title: '服务地址', icon: 'mdi-server', group: '认证' },
    { title: '租户', icon: 'mdi-account-supervisor' },
    { title: '域', icon: 'mdi-domain' },

]
// init cookies
if (!$cookies.get('navigationItem') || !navigationItems[$cookies.get('navigationItem')]){
    $cookies.set('navigationItem', 0);
}

new Vue({
    el: '#app',
    delimiters: ['[[', ']]'],
    vuetify: new Vuetify(),
    data: {
        ui: {
            theme: SETTINGS.getItem('theme'),
            navigatorWidth: SETTINGS.getItem('navigatorWidth'),
        },
        UTILS: Utils,
        clusterTable: clusterTable,
        regionTable: regionTable,
        settings: SETTINGS,
        I18N: I18N,
        identity: {
            showAllService: false,
            serviceMap: {},
            users: {},
            projectMap: {},
            endpointTable: endpointTable,
            userTable: userTable,
            projectTable: projectTable,
            projectUserDialog: projectUserDialog,
            newUserDialog: newUserDialog,
            rolesDialog: rolesDialog,
            newRoleDialog: newRoleDialog,
            domainTable: domainTable,
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
            aggTable: aggTable,
            migrationTable: migrationTable,
            serverTopology: serverTopology,
            serverActions: serverActions,
            serverActionEvents: serverActionEvents,
            serverConsoleLog: serverConsoleLog,
            updateServerSG: updateServerSG,
        },
        image: {
            imageTable: imageTable,
        },
        networking: {
            tab: 0,
            routerTable: routerTable,
            networkTable: netTable,
            portTable: portTable,
            sgTable: sgTable,
            qosPolicyTable: qosPolicyTable,
            sgRulesDialog: sgRulesDialog,
            newSGDialog: newSGDialog,
            newSGRuleDialog: newSGRuleDialog,
            qosPolicyRulesDialog: qosPolicyRulesDialog,
            newQosPolicyRuleDialog: newQosPolicyRule,
            updatePortDialog: updatePortDialog,
        },
        volume: {
            tab: 0,
            volumeTable: volumeTable,
            volumeTypeTable: volumeTypeTable,
            snapshotTable: snapshotTable,
            backupTable: backupTable,
            volumeComputeServiceTable: volumeComputeServiceTable,
        },
        navigation: {
            item: $cookies.get('navigationItem'),
            items: navigationItems,
        },
        drawer: true,
        miniVariant: false,
        // storage dialogs
        newVolumeDialog: newVolume,
        newSnapshotDialog: newSnapshotDialog,
        newVolumeTypeDialog: newVolumeTypeDialog,
        newBackupDialog: newBackupDialog,
        volumeResetStateDialog: volumeResetStateDialog,
        backupResetStateDialog: backupResetStateDialog,
        snapshotResetStateDialog: snapshotResetStateDialog,
        // image dialogs
        imageDeleteSmartDialog: imageDeleteSmartDialog,
        imagePropertiesDialog: imagePropertiesDialog,
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
        evacuateDialog: evacuateDialog,
        rebuildDialog: rebuildDialog,
        newKeypairDialog: newKeypairDialog,
        // network dialogs
        newNetDialog: newNetDialog,
        newRouterDialog: newRouterDialog,
        newSubnetDialog: newSubnetDialog,
        routerInterfacesDialog: routerInterfacesDialog,
        newPortDialog: newPortDialog,
        newQosPolicyDialog: newQosPolicyDialog,
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
                case '服务地址':
                    this.getServices();
                    this.identity.endpointTable.refresh();
                    break;
                case '租户':
                    this.identity.projectTable.refresh();
                    this.identity.userTable.refresh();
                    break;
                case '域':
                    this.identity.domainTable.refresh();
                    break;
                case '实例':
                    this.computing.serverTable.refresh();
                    this.computing.serverTable.recheckSavedTasks();
                    break;
                case '计算管理':
                    this.computing.flavorTable.refresh();
                    this.computing.flavorTable.refreshExtraSpecs();
                    this.computing.keypairTable.refresh();
                    this.computing.serviceTable.refresh();
                    this.computing.azTable.refresh();
                    this.computing.aggTable.refresh();
                    break;
                case '虚拟化资源':
                    this.computing.hypervisorTable.refresh();
                    this.computing.hypervisorTable.refreshStatics();
                    // this.computing.usageTable.refresh();
                    break;
                case '网络资源':
                    this.networking.networkTable.refresh();
                    this.networking.networkTable.refreshSubnets();
                    this.networking.portTable.refresh();
                    this.networking.routerTable.refresh();
                    this.networking.sgTable.refresh();
                    this.networking.qosPolicyTable.refresh();
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
                    this.volume.volumeComputeServiceTable.refresh();
                    break;
            }
        },
        useCluster: function () {
            let cluster = this.clusterTable.getSelectedCluster()
            if (cluster){
                $cookies.set('clusterId', cluster.id);
                $cookies.set('clusterName', cluster.name);
                window.open('/dashboard', '_self');
            }
        },
        useRegion: function(){
            if (! this.regionTable.selected){
                $cookies.remove('region');
            } else {
                $cookies.set('region', this.regionTable.selected);
            }
            window.open('/dashboard', '_self');
        },
        drawAz() {
            this.computing.azTable.drawTopoloy('az');
        },
        saveSettings(){
            this.settings.save();
            MESSAGE.success('配置已保存');
        },
        resetSettings(){
            this.settings.reset();
            MESSAGE.success('配置已重置');
        },
    },
    mounted: function () {
        // this.drawAz();
    },
    created: async function () {
        await this.clusterTable.refresh();
        this.clusterTable.setSelected($cookies.get('clusterId'));
        init($cookies);
        try {
            await this.regionTable.refresh();
            this.regionTable.setSelected($cookies.get('region'));

            this.refreshContainer();
        } catch(e) {
            if (e.message == 'Request failed with status code 404'){
                ALERT.error(`Region ${$cookies.get('region')} 异常，切换到默认Region`)
                $cookies.remove('region');
                window.open('/dashboard', '_self')
            }
        } finally {
            let loader = document.getElementById('loader');
            if (loader){
                loader.remove()
            }
        }
    },
    watch: {
        'navigation.item': {
            handler(newValue, oldValue) {
                if (newValue != undefined) {
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
