<template>
    <v-row>
        <v-col>
            <v-data-table-server show-expand single-expand show-select density='compact' :loading="table.loading"
                :headers="table.headers" :items="table.items" :items-per-page="table.itemsPerPage" :search="table.search"
                class="elevation-1" v-model="table.selected" :items-length="totlaVolumes.length" @update:options="pageRefresh">
                <template v-slot:top>
                    <v-row>
                        <v-col cols="12" md="6" sm="12">
                            <v-toolbar density="compact" class="rounded-pill">
                                <v-btn icon="mdi-plus" color="primary"
                                    @click="openNewVolumeDialog = !openNewVolumeDialog"></v-btn>
                                <v-btn color="info" @click="openVolumeExtendDialog = true"
                                    :disabled="table.selected.length == 0">扩容</v-btn>
                                <v-btn color="warning" @click="openVolumeStatusResetDialog = true"
                                    :disabled="table.selected.length == 0">状态重置</v-btn>
                                <v-spacer></v-spacer>
                                <v-btn icon="mdi-trash-can" color="red" @click="table.deleteSelected()"
                                    :disabled="table.selected.length == 0">
                                </v-btn>
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
                        <v-chip v-if="item.bootable == 'true'" size="small" outlined color="info">启动盘</v-chip>
                        <v-chip v-if="item.multiattach == 'true'" size="small" outlined color="info">共享</v-chip>
                    </span>
                </template>
                <template v-slot:[`item.image_name`]="{ item }">
                    <v-chip size="x-small" label v-if="item.volume_image_metadata">{{ item.volume_image_metadata.image_name
                    }}</v-chip>
                </template>
                <template v-slot:[`item.actions`]="{ item }">
                    <v-menu offset-y>
                        <template v-slot:activator="{ progs }">
                            <v-btn size="x-small" color="purple" v-bind="progs" icon="mdi-dots-vertical"></v-btn>
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
                                <tbody>
                                    <template v-for="extendItem in Object.keys(item)">
                                        <tr v-bind:key="extendItem" v-if="table.columns.indexOf(extendItem) < 0">
                                            <td class="text-info">{{ extendItem }}:</td>
                                            <td>{{ item[extendItem] }}</td>
                                        </tr>
                                    </template>
                                </tbody>
                            </template>
                        </v-table>
                    </td>
                </template>
            </v-data-table-server>
        </v-col>
        <v-col cols="12">
            <NewVolumeVue :show.sync="openNewVolumeDialog" @completed="table.refresh()" />
            <VolumeStatusResetDialog :volumes="table.selected" :show.sync="openVolumeStatusResetDialog"
                @completed="table.refresh()" />
            <ResourceActionsDialog :show.sync="showResourceActionsDialog" :resource="selectedVolume">
            </ResourceActionsDialog>
            <VolumeExtendVue :volumes="table.selected" :show.sync="openVolumeExtendDialog" @completed="table.refresh()">
            </VolumeExtendVue>
        </v-col>
    </v-row>
</template>

<script>
import API from '@/assets/app/api';
import { VolumeDataTable } from '@/assets/app/tables.jsx';
import { Utils } from '@/assets/app/lib.js';
import SETTINGS from '@/assets/app/settings';

import NewVolumeVue from './dialogs/NewVolume.vue';
import VolumeStatusResetDialog from './dialogs/VolumeStatusResetDialog.vue';
import VolumeExtendVue from './dialogs/VolumeExtend.vue';
import ResourceActionsDialog from './dialogs/ResourceActionsDialog.vue';

export default {
    components: {
        NewVolumeVue, VolumeStatusResetDialog, VolumeExtendVue,
        ResourceActionsDialog,
    },

    data: () => ({
        Utils: Utils,
        openNewVolumeDialog: false,
        openVolumeStatusResetDialog: false,
        openVolumeExtendDialog: false,
        showResourceActionsDialog: false,
        selectedVolume: {},
        supportResourceAction: SETTINGS.openstack.getItem('supportResourceAction').value,
        table: new VolumeDataTable(),
        totlaVolumes: [],
    }),
    methods: {
        pageRefresh: function ({ page, itemsPerPage, sortBy }) {
            let filter = { limit: itemsPerPage }
            if (page > 1 && this.totlaVolumes.length > 1) {
                let index = itemsPerPage * (page - 1) - 1
                filter.marker = this.totlaVolumes[index].id
            }
            this.table.refresh(filter)
            API.volume.list().then((data) => {
                console.log(data)
                this.totlaVolumes = data.volumes
            })
        },
        openResourceActionsDialog(item) {
            this.selectedVolume = item;
            this.showResourceActionsDialog = !this.showResourceActionsDialog;
        }
    },
    created() {
        // this.table.refresh();
    }
};
</script>
    