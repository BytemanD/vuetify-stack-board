<template>
    <v-row>
        <v-col>
            <v-data-table-server show-expand single-expand show-select density='compact' :loading="table.loading"
                :headers="table.headers" :items="table.items" :items-per-page="table.itemsPerPage" :search="table.search"
                v-model="table.selected" :items-length="totlaVolumes.length" @update:options="pageRefresh">
                <template v-slot:top>
                    <v-row>
                        <v-col cols="12" md="6" sm="12">
                            <v-toolbar density="compact" class="rounded-pill ma-0 pa-0">
                                <NewVolumeVue @completed="table.refresh()" />
                                <VolumeExtendVue :volumes="table.getSelectedItems()" @volume-extended="updateVolume"></VolumeExtendVue>
                                <VolumeStatusResetDialog :volumes="table.selected" @completed="table.refresh()" />
                                <v-spacer></v-spacer>
                                <delete-comfirm-dialog :disabled="table.selected.length == 0" title="确定删除卷?"
                                    @click:comfirm="deleteSelected()" :items="table.getSelectedItems()" />
                            </v-toolbar>
                        </v-col>
                        <v-col>
                            <v-text-field density='compact' v-model="table.search" label="搜索卷ID或名字" single-line
                                hide-details></v-text-field>
                        </v-col>
                        <v-col cols="1" class="text-center">
                            <v-btn color="info" variant="text" icon="mdi-refresh" v-on:click="table.refresh()"></v-btn>
                        </v-col>
                    </v-row>
                </template>

                <template v-slot:[`item.status`]="{ item }">
                    <span>
                        <v-icon v-if="item.status == 'available'">mdi-link-variant-off</v-icon>
                        <v-icon v-else-if="item.status == 'in-use'" color="success">mdi-link-variant</v-icon>
                        <v-icon v-else-if="item.status == 'error'" color="red">mdi-close-circle</v-icon>
                        <v-icon v-else-if="item.status == 'error_deleting'" color="red">mdi-delete-alert</v-icon>
                        <v-tooltip top v-else-if="table.isDoing(item)">
                            <template v-slot:activator="{ progs }">
                                <v-icon color="warning" class="mdi-spin" v-bind="progs">mdi-rotate-right</v-icon>
                            </template>
                            {{ item.status }}
                        </v-tooltip>
                        <v-tooltip top v-else>
                            <template v-slot:activator="{ progs }">
                                <v-icon color="warning" v-bind="progs">mdi-alert-circle</v-icon>
                            </template>
                            {{ item.status }}
                        </v-tooltip>
                        <v-chip v-if="item.bootable == 'true'" size="x-small" color="info">启动盘</v-chip>
                        <v-chip v-if="item.multiattach" size="x-small" color="purple">共享</v-chip>
                    </span>
                </template>
                <template v-slot:[`item.image_name`]="{ item }">
                    <v-chip size="small" variant="text" v-if="item.volume_image_metadata">
                        {{ item.volume_image_metadata.image_name }}</v-chip>
                </template>
                <template v-slot:[`item.actions`]="{ item }">
                    <v-menu offset-y>
                        <template v-slot:activator="{ props }">
                            <v-btn variant="text" color="purple" v-bind="props"
                                icon="mdi-dots-vertical"></v-btn>
                        </template>
                        <v-list density='compact'>
                            <v-list-item @click="openResourceActionsDialog(item)" :disabled="!supportResourceAction">
                                <v-list-item-title>操作记录</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </template>
                <template v-slot:expanded-row="{ columns, item }">
                    <td></td>
                    <td :colspan="columns.length - 1">
                        <v-table density='compact'>
                            <template v-slot:default>
                                <template v-for="extendItem in Object.keys(item)">
                                    <tr v-bind:key="extendItem" v-if="table.columns.indexOf(extendItem) < 0">
                                        <td class="text-info">{{ extendItem }}:</td>
                                        <td>{{ item[extendItem] }}</td>
                                    </tr>
                                </template>
                            </template>
                        </v-table>
                    </td>
                </template>
            </v-data-table-server>
        </v-col>
        <v-col cols="12">
            <ResourceActionsDialog :show.sync="showResourceActionsDialog" :resource="selectedVolume">
            </ResourceActionsDialog>
        </v-col>
    </v-row>
</template>

<script>
import API from '@/assets/app/api';
import { VolumeDataTable, VolumeTaskWaiter } from '@/assets/app/tables.jsx';
import { Utils } from '@/assets/app/lib.js';
import SETTINGS from '@/assets/app/settings';

import DeleteComfirmDialog from '@/components/plugins/dialogs/DeleteComfirmDialog.vue';
import NewVolumeVue from './dialogs/NewVolume.vue';
import VolumeStatusResetDialog from './dialogs/VolumeStatusResetDialog.vue';
import VolumeExtendVue from './dialogs/VolumeExtend.vue';
import ResourceActionsDialog from './dialogs/ResourceActionsDialog.vue';

export default {
    components: {
        NewVolumeVue, VolumeStatusResetDialog, VolumeExtendVue,
        ResourceActionsDialog, DeleteComfirmDialog,
    },

    data: () => ({
        Utils: Utils,
        openVolumeStatusResetDialog: false,
        openVolumeExtendDialog: false,
        showResourceActionsDialog: false,
        selectedVolume: {},
        supportResourceAction: SETTINGS.openstack.getItem('supportResourceAction').value,
        table: new VolumeDataTable(),
        totlaVolumes: [],
    }),
    methods: {
        deleteSelected: async function () {
            let selected = this.table.selected;
            await this.table.deleteSelected()
            for (let i in selected) {
                let serverId = selected[i];
                await this.table.waitVolumeDeleted(serverId)
                this.refreshTotalVolumes()
            }
            // this.refreshTotlaServers()
        },
        refreshTotalVolumes: function () {
            let self = this;
            API.volume.list().then((data) => {
                self.totlaVolumes = data.volumes
            })
        },
        pageRefresh: function ({ page, itemsPerPage, sortBy }) {
            let filter = {}
            if (itemsPerPage) {
                if (itemsPerPage >= 0) {
                    filter.limit = itemsPerPage
                }
            } else {
                filter.limit = this.table.itemsPerPage
            }
            if (page > 1 && this.totlaVolumes.length > 1) {
                let index = filter.limit * (page - 1) - 1
                filter.marker = this.totlaVolumes[index].id
            }
            if (page > 1 && this.totlaVolumes.length > 1) {
                let index = itemsPerPage * (page - 1) - 1
                filter.marker = this.totlaVolumes[index].id
            }
            this.table.refresh(filter)
            this.refreshTotalVolumes()
        },
        openResourceActionsDialog(item) {
            this.selectedVolume = item;
            this.showResourceActionsDialog = !this.showResourceActionsDialog;
        },
        updateVolume: async function(item) {
            this.table.updateItem(item)
        }
    },
    created() {
        // this.table.refresh();
    }
};
</script>
    