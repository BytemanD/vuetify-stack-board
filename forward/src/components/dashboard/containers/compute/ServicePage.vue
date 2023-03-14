<template>
    <v-row>
        <v-col>
            <v-btn small color="error" @click="table.deleteSelected()"><v-icon small>mdi-trash-can</v-icon> 删除</v-btn>
        </v-col>
        <v-col>
            <v-text-field small dense single-line hide-details v-model="table.search" append-icon="mdi-magnify" label="搜索"></v-text-field>
        </v-col>
        <v-col cols="1" class="text-center">
            <v-btn fab x-small color="info" v-on:click="table.refresh()"><v-icon>mdi-refresh</v-icon></v-btn>
        </v-col>
        <v-col cols="12">
            <v-data-table :headers="table.headers" :items="table.items" :items-per-page="table.itemsPerPage" :search="table.search"
                class="elevation-1" dense show-select v-model="table.selected">
                <template v-slot:[`item.status`]="{ item }">
                    <v-switch class="my-auto"  hide-details v-model="item.status" color="success"
                        :disabled="item.binary != 'nova-compute'" @click="table.enable(item)"></v-switch>
                </template>
                <template v-slot:[`item.forced_down`]="{ item }">
                    <v-switch class="my-auto" v-model="item.forced_down" hide-details color="warning"
                        :disabled="item.binary != 'nova-compute'" @click="table.forceDown(item)"></v-switch>
                </template>
                <template v-slot:[`item.state`]="{ item }">
                    <v-icon v-if="item.state == 'up'" color="success">mdi-emoticon-happy</v-icon>
                    <v-icon v-else color="error">mdi-emoticon-sad</v-icon>
                </template>
            </v-data-table>
        </v-col>
    </v-row>
</template>

<script>
import { ComputeServiceTable } from '@/assets/app/tables.js';
import { Utils } from '@/assets/app/lib.js';

export default {
    components: {

    },

    data: () => ({
        Utils: Utils,
        table: new ComputeServiceTable()

        // miniVariant: false,
    }),
    methods: {

    },
    created() {
        this.table.refresh();
    }
};
</script>
