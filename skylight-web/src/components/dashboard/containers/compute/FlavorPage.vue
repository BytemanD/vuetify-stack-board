<template>
    <v-row>
        <v-col cols="12">
            <v-data-table show-select show-expand single-expand density='compact' :loading="table.loading"
                :headers="table.headers" :items="table.items" :items-per-page="table.itemsPerPage" :search="table.search"
                v-model="table.selected">

                <template v-slot:top>
                    <v-row>
                        <v-col cols="12" md="7" sm="12">
                            <v-toolbar density="compact" class="rounded-pill">
                                <NewFlavorDialog @completed="table.refresh()" />
                                <v-spacer></v-spacer>
                                <v-btn icon="mdi-trash-can" color="red" :disabled="table.selected.length == 0"
                                    @click="table.deleteSelected()"></v-btn>
                            </v-toolbar>
                        </v-col>
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

                <template v-slot:[`item.ram`]="{ item }">{{ Utils.humanRam(item.ram) }}</template>
                <template v-slot:expanded-row="{ columns, item }">
                    <td></td>
                    <td>属性</td>
                    <td :colspan="columns.length - 1">
                        <v-chip size="small" label class="mt-1 mb-1 mr-1"
                            v-for="(value, key) in table.extraSpecsMap[item.id]" v-bind:key="key">
                            {{ key }}={{ value }}
                        </v-chip>
                        <v-btn text="编辑属性" color="warning" variant="text" class="my-auto"
                            @click="openFlavorExtraDialog(item)"></v-btn>
                    </td>
                </template>
            </v-data-table>
        </v-col>
        <FlavorExtraDialog :show="showFlavorExtraDialog" @update:show="(e) => showFlavorExtraDialog = e"
            :flavor="selectedFlavor" @completed="table.refresh()" />
    </v-row>
</template>
    
<script>
import { FlavorDataTable } from '@/assets/app/tables.jsx';
import { Utils } from '@/assets/app/lib.js';

import NewFlavorDialog from './dialogs/NewFlavorDialog.vue';
import FlavorExtraDialog from './dialogs/FlavorExtraDialog.vue';


export default {
    components: {
        NewFlavorDialog, FlavorExtraDialog
    },

    data: () => ({
        Utils: Utils,
        showFlavorExtraDialog: false,
        selectedFlavor: {},
        table: new FlavorDataTable()
    }),
    methods: {
        openFlavorExtraDialog(item) {
            this.selectedFlavor = item;
            this.showFlavorExtraDialog = !this.showFlavorExtraDialog;
        }
    },
    created() {
        this.table.refresh();
    }
};
</script>
    