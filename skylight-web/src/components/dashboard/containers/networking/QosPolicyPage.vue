<template>
    <v-row>
        <v-col cols="12">
            <v-data-table show-select show-expand single-expand density='compact' :loading="table.loading"
                :headers="table.headers" :items="table.items" :items-per-page="table.itemsPerPage" :search="table.search"
                v-model="table.selected">

                <template v-slot:top>
                    <v-row>
                        <v-col cols="12" md="7" sm="12">
                            <v-toolbar density="compact" class="rounded-pill">
                                <NewQosPolicyDialog @completed="table.refresh()" />
                                <v-spacer></v-spacer>
                                <delete-comfirm-dialog :disabled="table.selected.length == 0" title="确定删除QoS策略?"
                                    @click:comfirm="table.deleteSelected()" :items="table.getSelectedItems()" />
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

                <template v-slot:[`item.actions`]="{ item }">
                    <v-btn size="small" variant="text" color="purple" @click="openQosPolicyRulesDialog(item)">规则管理</v-btn>
                </template>
                <template v-slot:[`item.is_default`]="{ item }">
                    <v-switch hide-details color="info" v-model="item.is_default"
                        @click="table.updateDefault(item)"></v-switch>
                </template>
                <template v-slot:[`item.shared`]="{ item }">
                    <v-switch hide-details color="info" class="my-auto" v-model="item.shared"
                        @click="table.updateShared(item)"></v-switch>
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
        <QosPolicyRulesDialog :show="showQosPolicyRulesDialog" @update:show="(e) => showQosPolicyRulesDialog = e"
            :qos-policy="selectedQosPolicy" @completed="table.refresh()" />
    </v-row>
</template>

<script>
import { QosPolicyDataTable } from '@/assets/app/tables';

import DeleteComfirmDialog from '@/components/plugins/dialogs/DeleteComfirmDialog.vue';
import NewQosPolicyDialog from './dialogs/NewQosPolicyDialog.vue';
import QosPolicyRulesDialog from './dialogs/QosPolicyRulesDialog.vue';

export default {
    components: {
        NewQosPolicyDialog, QosPolicyRulesDialog,DeleteComfirmDialog,
    },
    data: () => ({
        table: new QosPolicyDataTable(),
        showNewQosPolicyDialog: false,
        showQosPolicyRulesDialog: false,
        selectedQosPolicy: {}
    }),
    methods: {
        openQosPolicyRulesDialog(qosPolicy) {
            this.selectedQosPolicy = qosPolicy;
            this.showQosPolicyRulesDialog = !this.showQosPolicyRulesDialog;
        }
    },
    created() {
        this.table.refresh();
    }
};
</script>
