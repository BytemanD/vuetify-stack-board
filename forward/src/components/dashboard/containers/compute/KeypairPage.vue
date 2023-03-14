<template>
    <v-row>
        <v-col>
            <v-btn small color="primary" ><v-icon small>mdi-plus</v-icon>添加</v-btn>
            <v-btn small color="error" @click="table.deleteSelected()">删除</v-btn>
        </v-col>
        <v-col cols="6">
            <v-text-field small dense single-line hide-details v-model="table.search" append-icon="mdi-magnify" label="搜索"></v-text-field>
        </v-col>
        <v-col cols="1" class="text-center">
            <v-btn fab x-small color="info" v-on:click="table.refresh()"><v-icon>mdi-refresh</v-icon></v-btn>
        </v-col>
        <v-col cols="12">
            <v-data-table dense show-expand single-expand :headers="table.headers" :items="table.items"
                :items-per-page="table.itemsPerPage" :search="table.search" class="elevation-1" v-model="table.selected">

                <template v-slot:[`item.name`]="{ item }">
                    {{ item.name }} <v-icon small color="info" @click="Utils.copyContent(item.public_key, '公钥内容已复制')">mdi-content-copy</v-icon>
                </template>
                <template v-slot:expanded-item="{ headers, item }">
                    <td></td>
                    <td :colspan="headers.length -1" >
                    <v-textarea hide-details filled readonly v-model="item.public_key"></v-textarea>
                    </td>
                </template>
                
            </v-data-table>
        </v-col>
    </v-row>
</template>

<script>

import { KeypairDataTable } from '@/assets/app/tables.js';
import { Utils } from '@/assets/app/lib.js';

export default {
    components: {

    },

    data: () => ({
        Utils: Utils,
        table: new KeypairDataTable()

        // miniVariant: false,
    }),
    methods: {

    },
    created() {
        this.table.refresh();
    }
};
</script>
