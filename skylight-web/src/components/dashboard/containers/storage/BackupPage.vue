<template>
    <v-row>
        <v-col cols="12">
            <v-data-table show-expand single-expand show-select density='compact' :loading="table.loading"
                :headers="table.headers" :items="table.items" :items-per-page="table.itemsPerPage" :search="table.search"
                class="elevation-1" v-model="table.selected">

                <template v-slot:top>
                    <v-row>
                        <v-col cols="12" md="6" sm="12">
                            <v-toolbar density="compact" class="rounded-pill">
                                <NewBackupVue @completed="table.refresh()" />
                                <v-btn color="warning" @click="showBackupStateResetDialog = !showBackupStateResetDialog"
                                    :disabled="table.selected.length == 0">状态重置</v-btn>
                                    <v-spacer></v-spacer>
                                <v-btn color="red" @click="table.deleteSelected()" icon="mdi-trash-can"
                                    :disabled="table.selected.length == 0"></v-btn>
                            </v-toolbar>
                        </v-col>
                        <v-col>
                            <v-text-field small density='compact' v-model="table.search" 
                                label="搜索" single-line hide-details></v-text-field>
                        </v-col>
                        <v-col cols="1" class="text-center">
                            <v-btn color="info" icon="mdi-refresh" variant="text" v-on:click="table.refresh()"></v-btn>
                        </v-col>
                    </v-row>
                </template>


                <template v-slot:[`item.status_bootable_multi`]="{ item }">
                    <v-icon v-if="item.status == 'available'">mdi-link-variant-off</v-icon>
                    <v-icon v-else-if="item.status == 'in-use'" color="success">mdi-link-variant</v-icon>
                    <v-icon v-else-if="item.status == 'error'" color="red">mdi-close-circle</v-icon>
                    <p v-else>{{ item.status }}</p>|
                    <v-icon v-if="item.bootable == 'true'" color="success">mdi-check</v-icon>
                    <v-icon v-else color="red">mdi-close</v-icon>|
                    <v-icon v-if="item.multiattach == 'true'">mdi-check</v-icon>
                    <v-icon v-else>mdi-close</v-icon>
                </template>
                <template v-slot:[`item.image_name`]="{ item }">
                    <v-chip x-small label v-if="item.volume_image_metadata">{{ item.volume_image_metadata.image_name
                    }}</v-chip>
                </template>

                <template v-slot:expanded-row="{ columns, item }">
                    <td></td>
                    <td :colspan="columns.length-1">
                        <table>
                            <tr v-for="extendItem in table.extendItems" v-bind:key="extendItem.text">
                                <td><strong>{{ extendItem.text }}:</strong></td>
                                <td>{{ item[extendItem.value] }}</td>
                            </tr>
                        </table>
                    </td>
                </template>
            </v-data-table>
        </v-col>
        <BackupStatusResetDialog :show.sync="showBackupStateResetDialog" :backups="table.selected"
            @completed="table.refresh()" />
    </v-row>
</template>

<script>
import { BackupTable } from '@/assets/app/tables.jsx';

import NewBackupVue from './dialogs/NewBackup.vue';
import BackupStatusResetDialog from './dialogs/BackupStatusResetDialog.vue';

export default {
    components: {
        NewBackupVue,
        BackupStatusResetDialog,
    },

    data: () => ({
        table: new BackupTable(),
        showBackupStateResetDialog: false,
        showNewBackupDialog: false,
    }),
    methods: {

    },
    created() {
        this.table.refresh();
    }
};
</script>
    