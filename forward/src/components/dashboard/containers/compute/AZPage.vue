<template>
    <v-row>
        <v-col cols="6">
            <v-btn-toggle mandatory v-model="table.showTree">
                <v-btn small><v-icon>mdi-table</v-icon></v-btn>
                <v-btn small><v-icon @click="drawAz()">mdi-chart-tree</v-icon></v-btn>
            </v-btn-toggle>
        </v-col>
        <v-col :hidden="table.showTree != 0">
            <v-row>
                <v-col>
                    <v-select solo :items="Object.keys(table.azMap)" label="AZ" dense
                        v-model="table.zoneName"></v-select>
                </v-col>
                <v-col>
                    <v-text-field small solo dense v-model="table.search" append-icon="mdi-magnify" label="搜索"
                        hide-details></v-text-field>
                </v-col>
                <v-col cols="2" class="text-center">
                    <v-btn fab x-small color="info"
                        @click="table.refresh()"><v-icon>mdi-refresh</v-icon></v-btn>
                </v-col>
            </v-row>
        </v-col>
        <v-col cols="12">
            <v-data-table :hidden="table.showTree != 0" :headers="table.headers" :items="table.azMap[table.zoneName].hosts"
                :items-per-page="table.itemsPerPage" :search="table.search" class="elevation-1" dense show-select
                v-model="table.selected">
                <template v-slot:[`item.active`]="{ item }">
                    <v-icon v-if="item.active" color="success">mdi-emoticon-happy</v-icon>
                    <v-icon v-else color="error">mdi-emoticon-sad</v-icon>
                </template>
                <template v-slot:[`item.available`]="{ item }">
                    <v-icon v-if="item.available" color="success">mdi-emoticon-happy</v-icon>
                    <v-icon v-else color="error">mdi-emoticon-sad</v-icon>
                </template>
            </v-data-table>
        </v-col>
        <v-col :hidden="table.showTree != 1" cols="12">
            <v-card :hidden="table.showTree != 1">
                <v-card-text>
                    <div id="az" style="height:400px;"></div>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script>
import { AZDataTable } from '@/assets/app/tables.js';
import { Utils } from '@/assets/app/lib.js';

export default {
    components: {

    },

    data: () => ({
        Utils: Utils,
        table: new AZDataTable()
        // miniVariant: false,
    }),
    methods: {

    },
    created() {
        this.table.refresh();
    }
};
</script>
