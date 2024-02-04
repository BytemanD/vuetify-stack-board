<template>
    <v-row>
        <v-col cols="12">
            <v-data-table show-expand single-expand show-select density='compact' :loading="table.loading"
                :headers="table.headers" :items="table.items" :items-per-page="table.itemsPerPage" :search="table.search"
                class="elevation-1" v-model="table.selected">

                <template v-slot:top>
                    <v-row>
                        <v-col cols="12" md="6" sm="12">
                            <v-toolbar density="compact" class="rounded-pill">
                                <NewSnapshotDialog @completed="table.refresh()" />
                                <v-btn small class="mr-1" color="warning"
                                    @click="showSnapshotResetStateDialog = !showSnapshotResetStateDialog"
                                    :disabled="table.selected.length == 0">状态重置</v-btn>
                                <v-spacer></v-spacer>
                                <delete-comfirm-dialog :disabled="table.selected.length == 0" title="确定删除快照?"
                                    @click:comfirm="table.deleteSelected()" :items="table.getSelectedItems()" />
                            </v-toolbar>
                        </v-col>
                        <v-col>
                            <v-text-field small density='compact' v-model="table.search" label="搜索" single-line
                                hide-details></v-text-field>
                        </v-col>
                        <v-col cols="1" class="text-center">
                            <v-btn color="info" icon="mdi-refresh" variant="text" v-on:click="table.refresh()"></v-btn>
                        </v-col>
                    </v-row>
                </template>

                <template v-slot:expanded-row="{ columns, item }">
                    <td></td>
                    <td :colspan="columns.length - 1">
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

        <SnapshotStatusResetDialog :show.sync="showSnapshotResetStateDialog" :snapshots="table.selected"
            @completed="table.refresh()" />
    </v-row>
</template>

<script>
import { SnapshotTable } from '@/assets/app/tables.jsx';

import DeleteComfirmDialog from '@/components/plugins/dialogs/DeleteComfirmDialog.vue';
import NewSnapshotDialog from './dialogs/NewSnapshotDialog.vue';
import SnapshotStatusResetDialog from './dialogs/SnapshotStatusResetDialog.vue';

export default {
    components: {
        NewSnapshotDialog, SnapshotStatusResetDialog, DeleteComfirmDialog
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
    