<template>
    <v-row>
        <v-col>
            <v-btn x-small fab class="mr-1" color="primary"
                @click="openNewAggDialog = true"><v-icon>mdi-plus</v-icon></v-btn>
            <v-btn small color="red" @click="table.deleteSelected()" :disabled="table.selected.length == 0">
                <v-icon>mdi-trash-can</v-icon>删除
            </v-btn>
            <!-- <v-btn small color="warning" @click="">节点管理</v-btn> -->
        </v-col>
        <v-col>
            <v-text-field small density='compact' hide-details single-line v-model="table.search" 
                label="搜索"></v-text-field>
        </v-col>
        <v-col cols="1" class="text-center">
            <v-btn fab x-small color="info" v-on:click="table.refresh()"><v-icon>mdi-refresh</v-icon></v-btn>
        </v-col>
        <v-col cols="12">
            <v-data-table density='compact' show-select show-expand single-expand :loading="table.loading" :headers="table.headers"
                :items="table.items" :items-per-page="table.itemsPerPage" :search="table.search" class="elevation-1"
                v-model="table.selected">

                <template v-slot:[`item.host_num`]="{ item }">
                    <v-btn size="small" variant="text" icon color="info" @click="editAggHosts(item)">{{ item.hosts.length }}</v-btn>
                    <v-btn size="small" variant="text" icon="mdi-plus" color="primary" @click="openAggAddHostsDialog(item)"></v-btn>
                </template>
                <template v-slot:expanded-row="{ columns, item }">
                    <td></td>
                    <td :colspan="columns.length-1">
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
        <NewAggDialog :show.sync="openNewAggDialog" @completed="table.refresh()" />
        <AggHostDialog :show.sync="openAggHostsDialog" :aggregate="editAgg" @completed="table.refresh()" />
        <AggAddHostsDialog :show.sync="showAggAddHostsDialog" :aggregate="editAgg" @completed="table.refresh()" />
    </v-row>
</template>

<script>
import { AggDataTable } from '@/assets/app/tables.jsx';
import { Utils } from '@/assets/app/lib.js';

import NewAggDialog from './dialogs/NewAggDialog.vue';
import AggHostDialog from './dialogs/AggHostsDialog';
import AggAddHostsDialog from './dialogs/AggAddHostsDialog.vue';

export default {
    components: {
        NewAggDialog, AggHostDialog, AggAddHostsDialog
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
        openAggAddHostsDialog: function(agg){
            this.editAgg = agg;
            this.showAggAddHostsDialog = !this.showAggAddHostsDialog;
        }
    },
    created() {
        this.table.refresh();
    }
};
</script>
