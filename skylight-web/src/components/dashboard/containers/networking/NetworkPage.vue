<template>
    <v-row>
        <v-col cols="12">
            <v-data-table show-select show-expand single-expand density='compact' color="red" :loading="table.loading"
                :headers="table.headers" :items="table.items" :items-per-page="table.itemsPerPage" :search="table.search"
                v-model="table.selected">

                <template v-slot:top>
                    <v-row>
                        <v-col cols="12" md="7" sm="12">
                            <v-toolbar density="compact" class="rounded-pill">
                                <NewNetworkDialogVue @completed="table.refresh()" />
                                <v-spacer></v-spacer>
                                <v-btn icon="mdi-trash-can" color="red" :disabled="table.selected.length == 0"
                                    v-on:click="table.deleteSelected()"></v-btn>
                            </v-toolbar>
                        </v-col>
                        <v-col>
                            <v-text-field small density='compact' v-model="table.search" label="搜索" single-line
                                hide-details></v-text-field>
                        </v-col>
                        <v-col cols="1" class="text-center">
                            <v-btn variant="text" icon="mdi-refresh" color="info"
                                @click="table.refresh()"><v-icon>mdi-refresh</v-icon></v-btn>
                        </v-col>
                    </v-row>
                </template>

                <template v-slot:[`item.status`]="{ item }">
                    <v-icon v-if="item.status == 'ACTIVE'" color="success">mdi-emoticon-happy</v-icon>
                    <v-icon v-else color="red">mdi-emoticon-sad</v-icon>
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
                        <v-chip close x-small label color="cyan" v-bind:key="subnetId" @click:close="deleteSubnet(subnetId)"
                            text-color="white" class="mr-1" v-if="table.subnets[subnetId]">
                            {{ table.subnets[subnetId].cidr }}
                        </v-chip>
                    </template>
                    <v-btn size="x-small" variant="text" icon="mdi-plus" color="primary"
                        @click="openNewSubnetDialog(item)"></v-btn>
                </template>
                <template v-slot:expanded-row="{ columns, item }">
                    <td></td>
                    <td :colspan="columns.length - 1">
                        <table>
                            <tr v-for="extendItem in table.extendItems" v-bind:key="extendItem.title">
                                <td><strong>{{ extendItem.title }}:</strong> </td>
                                <td>{{ item[extendItem.title] }}</td>
                            </tr>
                        </table>
                    </td>
                </template>
            </v-data-table>
        </v-col>
        <NewSubnetDialog :show="showNewSubnetDialog"  @update:show="(e)=>showNewSubnetDialog=e"  :network="netToAddSubnet" @completed="refresh()" />
    </v-row>
</template>

<script>
import { NetDataTable } from '@/assets/app/tables';

import NewNetworkDialogVue from './dialogs/NewNetworkDialog.vue';
import NewSubnetDialog from './dialogs/NewSubnetDialog.vue'

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
        openNewSubnetDialog: function (network) {
            this.netToAddSubnet = network;
            this.showNewSubnetDialog = true;
        },
        refresh: async function () {
            await this.table.refreshSubnets();
            this.table.refresh();
        },
        deleteSubnet: async function (subnetId) {
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
