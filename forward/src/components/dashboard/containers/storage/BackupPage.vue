<template>
    <v-row>
        <v-col>
            <v-btn fab x-small color="primary" class="mr-1" @click="showNewBackupDialog = !showNewBackupDialog"><v-icon small>mdi-plus</v-icon></v-btn>
            <v-btn small color="warning" class="mr-1" @click="showBackupStateResetDialog = !showBackupStateResetDialog" :disabled="table.selected.length == 0">状态重置</v-btn>
            <v-btn small color="error" @click="table.deleteSelected()" :disabled="table.selected.length == 0">
                <v-icon small>mdi-trash-can</v-icon>删除</v-btn>
        </v-col>
        <v-col>
            <v-text-field small dense v-model="table.search" append-icon="mdi-magnify" label="搜索" single-line
                hide-details></v-text-field>
        </v-col>
        <v-col cols="1" class="text-center">
            <v-btn fab x-small color="info" v-on:click="table.refresh()"><v-icon>mdi-refresh</v-icon></v-btn>
        </v-col>

        <v-col cols="12">
            <v-data-table show-expand single-expand show-select dense :loading="table.loading" :headers="table.headers" :items="table.items"
                :items-per-page="table.itemsPerPage" :search="table.search" class="elevation-1" v-model="table.selected" >
                <template v-slot:[`item.status_bootable_multi`]="{ item }">
                    <v-icon v-if="item.status == 'available'">mdi-link-variant-off</v-icon>
                    <v-icon v-else-if="item.status == 'in-use'" color="success">mdi-link-variant</v-icon>
                    <v-icon v-else-if="item.status == 'error'" color="error">mdi-close-circle</v-icon>
                    <p v-else>{{ item.status }}</p>|
                    <v-icon v-if="item.bootable == 'true'" color="success">mdi-check</v-icon>
                    <v-icon v-else color="error">mdi-close</v-icon>|
                    <v-icon v-if="item.multiattach == 'true'">mdi-check</v-icon>
                    <v-icon v-else>mdi-close</v-icon>
                </template>
                <template v-slot:[`item.image_name`]="{ item }">
                    <v-chip x-small label v-if="item.volume_image_metadata">{{ item.volume_image_metadata.image_name }}</v-chip>
                </template>
    
                <template v-slot:expanded-item="{ headers, item }">
                    <td></td>
                    <td :colspan="headers.length - 1">
                        <table>
                            <tr v-for="extendItem in table.extendItems" v-bind:key="extendItem.text">
                                <td><strong>{{ extendItem.text }}:</strong></td>
                                <td>{{ item[extendItem.value] }}</td>
                            </tr>
                        </table>
                    </td>
                </template>
            </v-data-table>
        </v-col>
        <NewBackupVue :show.sync="showNewBackupDialog"  @completed="table.refresh()" />
        <BackupStatusResetDialog :show.sync="showBackupStateResetDialog" :backups="table.selected" @completed="table.refresh()" />
    </v-row>
</template>

<script>
import { BackupTable } from '@/assets/app/tables.js';

import NewBackupVue from './dialogs/NewBackup.vue';
import BackupStatusResetDialog from './dialogs/BackupStatusResetDialog.vue';

export default {
    components: {
        NewBackupVue,
        BackupStatusResetDialog,
    },

    data: () => ({
        table: new BackupTable(),
        showBackupStateResetDialog: false,
        showNewBackupDialog: false,
    }),
    methods: {

    },
    created() {
        this.table.refresh();
    }
};
</script>
    