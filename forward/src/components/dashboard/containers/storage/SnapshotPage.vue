<template>
    <v-row>
        <v-col>
            <v-btn fab x-small class="mr-1" color="primary" @click="showNewSnapshotDialog = !showNewSnapshotDialog"><v-icon small>mdi-plus</v-icon></v-btn>
            <v-btn small class="mr-1" color="warning" @click="showSnapshotResetStateDialog = !showSnapshotResetStateDialog" :disabled="table.selected.length == 0">状态重置</v-btn>
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
        <NewSnapshotDialog :show.sync="showNewSnapshotDialog" @completed="table.refresh()"/>
        <SnapshotStatusResetDialog :show.sync="showSnapshotResetStateDialog" :snapshots="table.selected" @completed="table.refresh()"/>
    </v-row>
</template>

<script>
import { SnapshotTable } from '@/assets/app/tables.js';

import NewSnapshotDialog from './dialogs/NewSnapshotDialog.vue';
import SnapshotStatusResetDialog from './dialogs/SnapshotStatusResetDialog.vue';

export default {
    components: {
        NewSnapshotDialog,
        SnapshotStatusResetDialog
    },
    data: () => ({
        table: new SnapshotTable(),
        showNewSnapshotDialog: false,
        showSnapshotResetStateDialog: false,
    }),
    methods: {

    },
    created() {
        this.table.refresh();
    }
};
</script>
    