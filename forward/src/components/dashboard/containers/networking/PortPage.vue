<template>
    <v-row>
        <v-col>
            <v-btn x-small fab color="primary" class="mr-1" @click="openNewPortDialog = true"><v-icon>mdi-plus</v-icon></v-btn>
            <v-btn small color="error" :disabled="table.selected.length == 0" @click="table.deleteSelected()">删除</v-btn>
        </v-col>
        <v-col>
            <v-text-field small dense single-line v-model="table.search" append-icon="mdi-magnify" label="搜索" hide-details></v-text-field>
        </v-col>
        <v-col cols="1" class="text-center">
            <v-btn fab x-small color="info" @click="table.refresh()"><v-icon>mdi-refresh</v-icon></v-btn>
        </v-col>
        <v-col cols="12">
            <v-data-table show-select show-expand single-expand dense :loading="table.loading" :headers="table.headers" :items="table.items"
                :items-per-page="table.itemsPerPage" :search="table.search" v-model="table.selected">
                <template v-slot:[`item.status`]="{ item }">
                    <v-icon v-if="item.status == 'ACTIVE'" color="success">mdi-emoticon-happy</v-icon>
                    <v-icon v-else color="error">mdi-emoticon-sad</v-icon>
                </template>
                <template v-slot:[`item.fixed_ips`]="{ item }">
                    <v-chip x-small v-for="(fixed_ip, i) in item.fixed_ips" v-bind:key="i">{{ fixed_ip.ip_address }}</v-chip>
                </template>
                <template v-slot:[`item.admin_state_up`]="{ item }">
                    <v-switch class="my-auto" color="success" v-model="item.admin_state_up" hide-details
                        @click="table.adminStateDown(item)"></v-switch>
                </template>
                <template v-slot:[`item.actions`]="{ item }">
                    <v-btn text small color="purple" @click="table.open(item)">更新</v-btn>
                </template>
                <template v-slot:expanded-item="{ headers, item }">
                    <td></td>
                    <td :colspan="headers.length - 1">
                        <table>
                            <template>
                                <tr v-for="extendItem in table.extendItems" v-bind:key="extendItem.text">
                                    <td><strong>{{ extendItem.text }}:</strong> </td>
                                    <td>{{ item[extendItem.value] }}</td>
                                </tr>
                            </template>
                        </table>
                    </td>
                </template>
            </v-data-table>
        </v-col>
        <v-col><NewPortDialog :show.sync="openNewPortDialog" @completed="table.refresh()"/></v-col>
    </v-row>
</template>

<script>
import { PortDataTable } from '@/assets/app/tables';

import NewPortDialog from './dialogs/NewPortDialog.vue';

export default {
    components: {
        NewPortDialog,
    },

    data: () => ({
        table: new PortDataTable(),
        openNewPortDialog: false
    }),
    methods: {

    },
    created() {
        this.table.refresh();
    }
};
</script>
