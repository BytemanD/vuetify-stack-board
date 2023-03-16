<template>
    <v-row>
        <v-col>
            <v-btn small color="primary" @click="newFlavorDialog.open()"><v-icon small>mdi-plus</v-icon>新建</v-btn>
            <v-btn small color="error" @click="table.deleteSelected()">删除</v-btn>
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
            <v-data-table show-select show-expand single-expand dense :headers="table.headers" :items="table.items"
                :items-per-page="table.itemsPerPage" :search="table.search" v-model="table.selected">
                <template v-slot:[`item.ram`]="{ item }">{{ Utils.humanRam(item.ram) }}</template>
                <template v-slot:expanded-item="{ headers, item }">
                    <td><v-btn icon class="my-auto"
                            @click="flavorExtraDialog.open(item)"><v-icon>mdi-pencil</v-icon></v-btn></td>
                    <td :colspan="headers.length - 1">
                        <v-chip small label class="mt-1 mb-1 mr-1" v-for="(value, key) in table.extraSpecsMap[item.id]"
                            v-bind:key="key">{{ key }}={{ value }}</v-chip>
                    </td>
                </template>
            </v-data-table>
        </v-col>
    </v-row>
</template>
    
<script>
import { FlavorDataTable } from '@/assets/app/tables.js';
import { Utils } from '@/assets/app/lib.js';

export default {
    components: {

    },

    data: () => ({
        Utils: Utils,
        table: new FlavorDataTable()
        // miniVariant: false,
    }),
    methods: {

    },
    created() {
        this.table.refresh();
    }
};
</script>
    