<template>
    <v-row>
        <v-col></v-col>
        <v-col cols="6">
            <v-text-field small dense single-line hide-details v-model="table.search" append-icon="mdi-magnify" label="搜索"></v-text-field>
        </v-col>
        <v-col cols="1" class="text-center">
            <v-btn fab x-small color="info" v-on:click="table.refresh()"><v-icon>mdi-refresh</v-icon></v-btn>
        </v-col>
        <v-col cols="12">
            <v-data-table dense show-expand single-expand :headers="table.headers" :items="table.items"
                :items-per-page="table.itemsPerPage" :search="table.search" class="elevation-1" v-model="table.selected">
                <template v-slot:[`item.status`]="{ item }">
                    <span class="red--text" v-if="item.status == 'failed'">{{ item.status }}</span>
                    <span class="green--text" v-else-if="item.status == 'completed'">{{ item.status }}</span>
                    <span v-else>{{ item.status }}</span>
                </template>
                <template v-slot:[`item.created_at`]="{ item }">
                    <span small>{{ Utils.parseUTCToLocal(item.created_at) }}</span>
                </template>
                <template v-slot:expanded-item="{ headers, item }">
                    <td></td>
                    <td :colspan="headers.length - 1">
                        <table>
                            <tr v-for="extendItem in table.extendItems" v-bind:key="extendItem.text">
                                <td><strong>{{extendItem.text }}:</strong></td>
                                <td>
                                    <span v-if="extendItem.value == 'updated_at'">
                                        {{Utils.parseUTCToLocal(item.updated_at)}}
                                    </span>
                                    <span v-else>{{ item[extendItem.value] }}</span>
                                </td>
                            </tr>
                        </table>
                    </td>
                </template>
            </v-data-table>
        </v-col>
    </v-row>
</template>

<script>

import { MigrationDataTable } from '@/assets/app/tables.js';
import { Utils } from '@/assets/app/lib.js';

export default {
    components: {

    },

    data: () => ({
        Utils: Utils,
        table: new MigrationDataTable()
    }),
    methods: {

    },
    created() {
        // this.table.refresh();
    }
};
</script>
