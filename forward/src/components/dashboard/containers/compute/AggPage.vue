<template>
    <v-row>
        <v-col>
            <v-btn small color="primary" @click="table.newItemDialog.open()"><v-icon>mdi-plus</v-icon></v-btn>
            <v-btn small color="error" @click="table.deleteSelected()" :disabled="table.selected.length == 0"><v-icon
                    small>mdi-trash-can</v-icon> 删除</v-btn>
            <!-- <v-btn small color="warning" @click="">节点管理</v-btn> -->
        </v-col>
        <v-col>
            <v-text-field small dense hide-details single-line v-model="table.search" append-icon="mdi-magnify"
                label="搜索"></v-text-field>
        </v-col>
        <v-col cols="1" class="text-center">
            <v-btn fab x-small color="info" v-on:click="table.refresh()"><v-icon>mdi-refresh</v-icon></v-btn>
        </v-col>
        <v-col cols="12">
            <v-data-table dense show-select show-expand single-expand :headers="table.headers" :items="table.items"
                :items-per-page="table.itemsPerPage" :search="table.search" class="elevation-1" v-model="table.selected">

                <template v-slot:[`item.host_num`]="{ item }">
                    <v-btn small text color="info" @click="table.aggHostsDialog.open(item)">{{ item.hosts.length }}</v-btn>
                </template>
                <template v-slot:expanded-item="{ headers, item }">
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
import { AggDataTable } from '@/assets/app/tables.js';
import { Utils } from '@/assets/app/lib.js';

export default {
    components: {

    },

    data: () => ({
        Utils: Utils,
        table: new AggDataTable()
        // miniVariant: false,
    }),
    methods: {

    },
    created() {
        this.table.refresh();
    }
};
</script>
