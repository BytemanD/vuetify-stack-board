<template>
    <v-row>
        <v-col cols="12">
            <v-data-table show-select density='compact' :loading="table.loading" :headers="table.headers"
                :items="table.items" :items-per-page="table.itemsPerPage" :search="table.search" v-model="table.selected">

                <template v-slot:top>
                    <v-row>
                        <v-col cols="12" md="5" sm="12">
                            <v-toolbar density="compact" class="rounded-pill">
                                <v-spacer></v-spacer>
                                <delete-comfirm-dialog :disabled="table.selected.length == 0" title="确定删除主机组?"
                                    @click:comfirm="table.deleteSelected()" :items="table.getSelectedItems()" />

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

            </v-data-table>
        </v-col>
    </v-row>
</template>

<script>
import { ServerGroupTable } from '@/assets/app/tables.jsx';
import { Utils } from '@/assets/app/lib.js';

import DeleteComfirmDialog from '@/components/plugins/dialogs/DeleteComfirmDialog.vue';

export default {
    components: {
        DeleteComfirmDialog,
    },

    data: () => ({
        Utils: Utils,
        showNewServerGroupDialog: false,
        table: new ServerGroupTable()
    }),
    methods: {
        openNewServerGroupDialog() {
            this.showNewServerGroupDialog = !this.showNewServerGroupDialog;
        }
    },
    created() {
        this.table.refresh();
    }
};
</script>
    