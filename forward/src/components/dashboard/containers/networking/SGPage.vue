<template>
    <v-row>
        <v-col>
            <v-btn small color="primary" @click="networking.newSGDialog.open()"><v-icon>mdi-plus</v-icon>新建</v-btn>
            <v-btn small color="error" @click="table.deleteSelected()">删除</v-btn>
        </v-col>
        <v-col>
            <v-text-field small dense v-model="table.search" append-icon="mdi-magnify" label="搜索" single-line
                hide-details></v-text-field>
        </v-col>
        <v-col cols="1" class="text-center">
            <v-btn fab x-small color="info" @click="table.refresh()"><v-icon>mdi-refresh</v-icon></v-btn>
        </v-col>
        <v-col cols="12">
            <v-data-table show-select show-expand single-expand dense :headers="table.headers" :items="table.items"
                :items-per-page="table.itemsPerPage" :search="table.search" v-model="table.selected">
                <template v-slot:[`item.actions`]="{ item }">
                    <v-btn text small color="purple" @click="networking.sgRulesDialog.open(item)">规则管理</v-btn>
                </template>
                <template v-slot:expanded-item="{ headers, item }">
                    <td></td>
                    <td></td>
                    <td :colspan="headers.length - 1">
                        <table>
                            <tr v-for="extendItem in table.extendItems" v-bind:key="extendItem.key">
                                <td><strong>{{extendItem.text }}:</strong> </td>
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
import { SecurityGroupDataTable } from '@/assets/app/tables';

export default {
    components: {
    },
    data: () => ({
        table: new SecurityGroupDataTable()
        // miniVariant: false,
    }),
    methods: {
    },
    created() {
        this.table.refresh();
    }
};
</script>
