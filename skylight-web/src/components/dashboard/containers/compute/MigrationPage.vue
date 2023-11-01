<template>
    <v-row>
        <v-col>
            <v-data-table density='compact' show-expand single-expand :loading="table.loading" :headers="table.headers" :items="table.items"
                :items-per-page="table.itemsPerPage" :search="table.search" class="elevation-1" v-model="table.selected">

                <template v-slot:top>
                    <v-row>
                        <v-col cols="12" md="5" sm="12"></v-col>
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

                <template v-slot:[`item.status`]="{ item }">
                    <span class="red--text" v-if="item.status == 'failed'">{{ item.status }}</span>
                    <span class="green--text" v-else-if="item.status == 'completed'">{{ item.status }}</span>
                    <span v-else>{{ item.status }}</span>
                </template>
                <template v-slot:[`item.created_at`]="{ item }">
                    <span small>{{ Utils.parseUTCToLocal(item.created_at) }}</span>
                </template>
                <template v-slot:expanded-row="{ columns, item }">
                    <td :colspan="columns.length-2">
                        <table class="ml-10">
                            <tr v-for="extendItem in table.extendItems" v-bind:key="extendItem.title">
                                <td><strong>{{extendItem.title }}:</strong></td>
                                <td>
                                    <span v-if="extendItem.key == 'updated_at'">
                                        {{Utils.parseUTCToLocal(item.updated_at)}}
                                    </span>
                                    <span v-else>{{ item[extendItem.key] }}</span>
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

import { MigrationDataTable } from '@/assets/app/tables.jsx';
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
        this.table.refresh();
    }
};
</script>
