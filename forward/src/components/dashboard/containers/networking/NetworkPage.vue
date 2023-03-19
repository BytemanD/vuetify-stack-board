<template>
    <v-row>
        <v-col>
            <v-btn x-small fab class="mr-1" color="primary" @click="openNewNetworkDialog = true">
                <v-icon>mdi-plus</v-icon>
            </v-btn>
            <v-btn small color="error" v-on:click="table.deleteSelected()">删除</v-btn>
        </v-col>
        <v-col>
            <v-text-field small dense v-model="table.search" append-icon="mdi-magnify" label="搜索" single-line
                hide-details></v-text-field>
        </v-col>
        <v-col cols="1" class="text-center">
            <v-btn fab x-small color="info" v-on:click="table.refresh()"><v-icon>mdi-refresh</v-icon></v-btn>
        </v-col>
        <v-col cols="12">
            <v-data-table show-select show-expand single-expand dense :loading="table.loading" :headers="table.headers"
                :items="table.items" :items-per-page="table.itemsPerPage" :search="table.search" v-model="table.selected">

                <template v-slot:[`item.status`]="{ item }">
                    <v-icon v-if="item.status == 'ACTIVE'" color="success">mdi-emoticon-happy</v-icon>
                    <v-icon v-else color="error">mdi-emoticon-sad</v-icon>
                </template>
                <template v-slot:[`item.admin_state_up`]="{ item }">
                    <v-switch class="my-auto" color="success" v-model="item.admin_state_up" hide-details
                        @click="table.adminStateDown(item)"></v-switch>
                </template>
                <template v-slot:[`item.shared`]="{ item }">
                    <v-switch class="my-auto" v-model="item.shared" hide-details @click="table.shared(item)"></v-switch>
                </template>
                <template v-slot:[`item.subnets`]="{ item }">
                    <template v-for="subnetId in item.subnets">
                        <v-chip close x-small label color="cyan" v-bind:key="subnetId"
                            @click:close="deleteSubnet(subnetId)" text-color="white" class="mr-1" v-if="table.subnets[subnetId]">
                            {{ table.subnets[subnetId].cidr }}
                        </v-chip>
                    </template>
                    <v-btn small icon @click="openNewSubnetDialog(item)"><v-icon>mdi-plus</v-icon></v-btn>
                </template>
                <template v-slot:expanded-item="{ headers, item }">
                    <td></td>
                    <td :colspan="headers.length - 1">
                        <table>
                            <tr v-for="extendItem in table.extendItems" v-bind:key="extendItem.text">
                                <td><strong>{{ extendItem.text }}:</strong> </td>
                                <td>{{ item[extendItem.value] }}</td>
                            </tr>
                        </table>
                    </td>
                </template>
            </v-data-table>
        </v-col>
        <NewNetworkDialogVue :show.sync="openNewNetworkDialog" @completed="table.refresh()" />
        <NewSubnetDialog :show.sync="showNewSubnetDialog" :network="netToAddSubnet" @completed="refresh()" />
    </v-row>
</template>

<script>
import { NetDataTable } from '@/assets/app/tables';

import NewNetworkDialogVue from './dialogs/NewNetworkDialog.vue';
import NewSubnetDialog  from './dialogs/NewSubnetDialog.vue'

export default {
    components: {
        NewNetworkDialogVue, NewSubnetDialog
    },
    data: () => ({
        table: new NetDataTable(),
        openNewNetworkDialog: false,
        showNewSubnetDialog: false,
        netToAddSubnet: null,

    }),
    methods: {
        openNewSubnetDialog: function(network){
            this.netToAddSubnet = network;
            this.showNewSubnetDialog = true;
        },
        refresh: async function(){
            await this.table.refreshSubnets();
            this.table.refresh();
        },
        deleteSubnet: async function(subnetId){
            await this.table.deleteSubnet(subnetId);
            this.refresh();
        }
    },
    created() {
        this.table.refreshSubnets();
        this.table.refresh();
    }
};
</script>
