<template>
    <v-row>
        <v-col>
            <v-btn x-small fab disabled color="primary" class="mr-1" @click="showNewServerGroupDialog = !showNewServerGroupDialog"><v-icon small>mdi-plus</v-icon></v-btn>
            <v-btn small color="error" :disabled="table.selected.length == 0" @click="table.deleteSelected()">删除</v-btn>
        </v-col>
        <v-col>
            <v-text-field small dense v-model="table.search" append-icon="mdi-magnify" label="搜索" single-line
                hide-details></v-text-field>
        </v-col>
        <v-col cols="1" class="text-center">
            <v-btn fab x-small color="info" v-on:click="table.refresh()"><v-icon>mdi-refresh</v-icon></v-btn>
        </v-col>
        <v-col cols="12">
            <v-data-table show-select dense :loading="table.loading" :headers="table.headers" :items="table.items"
                :items-per-page="table.itemsPerPage" :search="table.search" v-model="table.selected">
            </v-data-table>
        </v-col>
    </v-row>
</template>
    
<script>
import { ServerGroupTable } from '@/assets/app/tables.js';
import { Utils } from '@/assets/app/lib.js';


export default {
    components: {

    },

    data: () => ({
        Utils: Utils,
        showNewServerGroupDialog: false,
        table: new ServerGroupTable()
    }),
    methods: {
        openNewServerGroupDialog(){
            this.showNewServerGroupDialog = !this.showNewServerGroupDialog;
        }
    },
    created() {
        this.table.refresh();
    }
};
</script>
    