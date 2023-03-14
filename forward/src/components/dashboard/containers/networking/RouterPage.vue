<template>
    <v-row>
        <v-col>
            <v-btn small color="primary" @click="newRouterDialog.open()"><v-icon>mdi-plus</v-icon> 新建</v-btn>
            <v-btn small color="error" v-on:click="table.deleteSelected()">删除</v-btn>
        </v-col>
        <v-col>
            <v-text-field small dense hide-details single-line v-model="table.search" append-icon="mdi-magnify"
                label="搜索"></v-text-field>
        </v-col>
        <v-col cols="1" class="text-right">
            <v-btn fab x-small color="info" v-on:click="table.refresh()"><v-icon>mdi-refresh</v-icon></v-btn>
        </v-col>
        <v-col cols="12">
            <v-data-table show-select show-expand single-expand dense :headers="table.headers" :items="table.items"
                :items-per-page="table.itemsPerPage" :search="table.search" v-model="table.selected">
                <template v-slot:[`item.name`]="{ item }">
                    {{ item.name || item.id }}
                    <v-btn icon @click="routerInterfacesDialog.open(item)"><v-icon>mdi-serial-port</v-icon></v-btn>
                </template>
                <template v-slot:[`item.status`]="{ item }">
                    <v-icon v-if="item.status == 'ACTIVE'" color="success">mdi-emoticon-happy</v-icon>
                    <v-icon v-else color="error">mdi-emoticon-sad</v-icon>
                </template>
                <template v-slot:[`item.admin_state_up`]="{ item }">
                    <v-switch hide-details class="my-auto" color="success" v-model="item.admin_state_up"
                        @click="table.adminStateDown(item)"></v-switch>
                </template>
                <template v-slot:[`item.interfaces`]="{ item }">{{ table.listPorts(item) }}</template>
                <template v-slot:expanded-item="{ headers, item }">
                    <td></td>
                    <td></td>
                    <td :colspan="headers.length - 1">
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
    </v-row>
</template>

<script>
import { RouterDataTable } from '@/assets/app/tables';

export default {
    components: {
    },
    data: () => ({
        table: new RouterDataTable()
    }),
    methods: {

    },
    created() {
        this.table.refresh();
    }
};
</script>
