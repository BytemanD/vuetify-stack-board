<template>
    <v-row>
        <v-col>
            <v-btn x-small fab class="mr-1" color="primary" @click="openNewFlavorDialog = true"><v-icon
                    small>mdi-plus</v-icon></v-btn>
            <v-btn small class="mr-1" color="error" @click="table.deleteSelected()" :disabled="table.selected.length == 0">
                <v-icon small>mdi-trash-can</v-icon>删除</v-btn>
        </v-col>
        <v-col>
            <v-text-field small dense v-model="table.search" append-icon="mdi-magnify" label="搜索" single-line
                hide-details></v-text-field>
        </v-col>
        <v-col cols="1" class="text-center">
            <v-btn fab x-small color="info" v-on:click="table.refresh()"><v-icon>mdi-refresh</v-icon></v-btn>
        </v-col>

        <v-col cols="12">
            <v-data-table show-expand single-expand show-select dense :headers="table.headers" :items="table.items"
                :items-per-page="table.itemsPerPage" :search="table.search" class="elevation-1" v-model="table.selected">

                <template v-slot:[`item.is_public`]="{ item }">
                    <v-icon v-if="item.is_public == true" color="success">mdi-check</v-icon>
                    <v-icon v-else color="error">mdi-close</v-icon>
                </template>

                <template v-slot:[`item.extra_specs`]="{ item }">
                        <v-chip label x-small class="mr-1" v-for="(value, key) in item.extra_specs" v-bind:key="key">{{ key }}={{value}}</v-chip>
                </template>
                <template v-slot:expanded-item="{ headers, item }">
                    <td></td>
                    <td></td>
                    <td :colspan="headers.length - 1">
                        <tr v-for="extendItem in table.extendItems" v-bind:key="extendItem.text">
                            <td class="info--text">{{extendItem.text }}:</td>
                            <td>{{ item[extendItem.value] }}</td>
                        </tr>
                    </td>
                </template>
            </v-data-table>
        </v-col>
        <v-col cols="12">
            <NewVolumeType :show.sync="openNewFlavorDialog" @completed="table.refresh()" />
        </v-col>
    </v-row>
</template>

<script>
import { VolumeTypeTable } from '@/assets/app/tables.js';

import NewVolumeType from './dialogs/NewVolumeType.vue';

export default {
    components: {
        NewVolumeType
    },

    data: () => ({
        openNewFlavorDialog: false,
        table: new VolumeTypeTable()
        // miniVariant: false,
    }),
    methods: {

    },
    created() {
        this.table.refresh();
    }
};
</script>
    