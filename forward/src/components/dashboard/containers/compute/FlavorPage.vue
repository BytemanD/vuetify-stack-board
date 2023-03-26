<template>
    <v-row>
        <v-col>
            <v-btn x-small fab color="primary" class="mr-1" @click="openNewFlavorDialog = !openNewFlavorDialog"><v-icon small>mdi-plus</v-icon></v-btn>
            <v-btn small color="error" :disabled="table.selected.length == 0" @click="table.deleteSelected()">删除</v-btn>
        </v-col>
        <v-col cols="2" class="text-center">
            <v-switch dense class="my-auto" hide-details v-model="table.isPublic" label="共享"
                @click="table.refresh()"></v-switch>
        </v-col>
        <v-col>
            <v-text-field small dense v-model="table.search" append-icon="mdi-magnify" label="搜索" single-line
                hide-details></v-text-field>
        </v-col>
        <v-col cols="1" class="text-center">
            <v-btn fab x-small color="info" v-on:click="table.refresh()"><v-icon>mdi-refresh</v-icon></v-btn>
        </v-col>
        <v-col cols="12">
            <v-data-table show-select show-expand single-expand dense :loading="table.loading" :headers="table.headers" :items="table.items"
                :items-per-page="table.itemsPerPage" :search="table.search" v-model="table.selected">
                <template v-slot:[`item.ram`]="{ item }">{{ Utils.humanRam(item.ram) }}</template>
                <template v-slot:expanded-item="{ headers, item }">
                    <td><v-btn icon class="my-auto"
                            @click="openFlavorExtraDialog(item)"><v-icon>mdi-pencil</v-icon></v-btn></td>
                    <td :colspan="headers.length - 1">
                        <v-chip small label class="mt-1 mb-1 mr-1" v-for="(value, key) in table.extraSpecsMap[item.id]"
                            v-bind:key="key">{{ key }}={{ value }}</v-chip>
                    </td>
                </template>
            </v-data-table>
        </v-col>
        <NewFlavorDialog :show.sync="openNewFlavorDialog" @completed="table.refresh()"/>
        <FlavorExtraDialog :show.sync="showFlavorExtraDialog" :flavor="selectedFlavor" @completed="table.refresh()"/>
    </v-row>
</template>
    
<script>
import { FlavorDataTable } from '@/assets/app/tables.js';
import { Utils } from '@/assets/app/lib.js';

import NewFlavorDialog from './dialogs/NewFlavorDialog.vue';
import FlavorExtraDialog from './dialogs/FlavorExtraDialog.vue';


export default {
    components: {
        NewFlavorDialog, FlavorExtraDialog
    },

    data: () => ({
        Utils: Utils,
        openNewFlavorDialog: false,
        showFlavorExtraDialog: false,
        selectedFlavor: {},
        table: new FlavorDataTable()
    }),
    methods: {
        openFlavorExtraDialog(item){
            this.selectedFlavor = item;
            this.showFlavorExtraDialog = !this.showFlavorExtraDialog;
        }
    },
    created() {
        this.table.refresh();
    }
};
</script>
    