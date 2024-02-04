<template>
    <v-row>
        <v-col>
            <v-data-table density='compact' show-select show-expand single-expand :loading="table.loading"
                :headers="table.headers" :items="table.items" :items-per-page="table.itemsPerPage" :search="table.search"
                class="elevation-1" v-model="table.selected">
                <template v-slot:top>
                    <v-row>
                        <v-col cols="12" md="7" sm="12">
                            <v-toolbar density="compact" class="rounded-pill">
                                <NewAggDialog @completed="table.refresh()" />
                                <v-spacer></v-spacer>
                                <delete-comfirm-dialog :disabled="table.selected.length == 0" title="确定删除聚合?"
                                    @click:comfirm="table.deleteSelected()" :items="table.getSelectedItems()" />
                            </v-toolbar>
                        </v-col>
                        <v-col>
                            <v-text-field small density='compact' v-model="table.search" label="搜索" single-line
                                hide-details></v-text-field>
                        </v-col>
                        <v-col cols="1" class="text-center">
                            <v-btn variant="text" icon="mdi-refresh" color="info"
                                v-on:click="table.refresh()"><v-icon>mdi-refresh</v-icon></v-btn>
                        </v-col>
                    </v-row>
                </template>

                <template v-slot:[`item.host_num`]="{ item }">
                    <v-btn size="small" variant="text" icon color="info" @click="editAggHosts(item)">{{ item.hosts.length
                    }}</v-btn>
                    <v-btn size="small" variant="text" icon="mdi-plus" color="primary"
                        @click="openAggAddHostsDialog(item)"></v-btn>
                </template>
                <template v-slot:expanded-row="{ columns, item }">
                    <td></td>
                    <td :colspan="columns.length - 1">
                        <table>
                            <tr v-for="extendItem in table.extendItems" v-bind:key="extendItem.text">
                                <td><strong>{{ extendItem.title }}:</strong> </td>
                                <td>{{ item[extendItem.key] }}</td>
                            </tr>
                        </table>
                    </td>
                </template>
            </v-data-table>
        </v-col>

        <AggHostDialog :show="openAggHostsDialog"  @update:show="(e) => openAggHostsDialog = e" :aggregate="editAgg" @completed="table.refresh()" />
        <AggAddHostsDialog :show="showAggAddHostsDialog" @update:show="(e) => showAggAddHostsDialog = e" :aggregate="editAgg" @completed="table.refresh()" />
    </v-row>
</template>

<script>
import { AggDataTable } from '@/assets/app/tables.jsx';
import { Utils } from '@/assets/app/lib.js';

import DeleteComfirmDialog from '@/components/plugins/dialogs/DeleteComfirmDialog.vue';
import NewAggDialog from './dialogs/NewAggDialog.vue';
import AggHostDialog from './dialogs/AggHostsDialog';
import AggAddHostsDialog from './dialogs/AggAddHostsDialog.vue';

export default {
    components: {
        NewAggDialog, AggHostDialog, AggAddHostsDialog, DeleteComfirmDialog,
    },

    data: () => ({
        Utils: Utils,
        openNewAggDialog: false,
        openAggHostsDialog: false,
        showAggAddHostsDialog: false,
        editAgg: null,
        table: new AggDataTable()
    }),
    methods: {
        editAggHosts: function (agg) {
            this.editAgg = agg;
            this.openAggHostsDialog = !this.openAggHostsDialog;
        },
        openAggAddHostsDialog: function (agg) {
            this.editAgg = agg;
            this.showAggAddHostsDialog = !this.showAggAddHostsDialog;
        }
    },
    created() {
        this.table.refresh();
    }
};
</script>
