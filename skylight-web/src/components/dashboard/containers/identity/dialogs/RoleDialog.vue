<template>
    <v-dialog scrollable v-model="display" width="900">
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" color="primary" variant="text">角色管理</v-btn>
        </template>
        <v-card>
            <v-card-title class="headline primary lighten-2" primary-title>角色管理</v-card-title>
            <v-card-text>
                <v-data-table :headers="table.headers" :items="table.items" :items-per-page="table.itemsPerPage"
                    :search="table.search" density='compact' show-select v-model="table.selected">

                    <template v-slot:top>
                        <v-row>
                            <v-col>
                                <v-toolbar density="compact" class="rounded-pill">
                                    <NewRoleDialog @completed="table.refresh()" />
                                    <v-spacer></v-spacer>
                                    <delete-comfirm-dialog :disabled="table.selected.length == 0" title="确定删除角色?"
                                        @click:comfirm="table.deleteSelected()" :items="table.getSelectedItems()" />
                                </v-toolbar>
                            </v-col>
                            <v-col>
                                <v-select density='compact' outlined :items="dialog.domains" clearable label="Domain"
                                    :item-props="dialog.itemProps"
                                    item-text="name" item-value="id" v-model="dialog.domainId" v-on:change="changeDoamin()">
                                </v-select>
                            </v-col>
                            <v-col>
                                <v-text-field density='compact' single-line hide-details v-model="table.search"
                                    label="搜索"></v-text-field>
                            </v-col>
                            <v-col cols="1">
                                <v-btn variant="text" color="info" v-on:click="table.refresh()" icon="mdi-refresh"></v-btn>
                            </v-col>
                        </v-row>
                    </template>
                </v-data-table>
            </v-card-text>
        </v-card>

    </v-dialog>
</template>
    
<script>
import { RoleTable } from '@/assets/app/tables';
import { RolesDialog } from '@/assets/app/dialogs';

import DeleteComfirmDialog from '@/components/plugins/dialogs/DeleteComfirmDialog.vue';
import NewRoleDialog from './NewRoleDialog.vue';

export default {
    components: {
        NewRoleDialog, DeleteComfirmDialog
    },
    props: {
    },
    data: () => ({
        display: false,
        table: new RoleTable(),
        dialog: new RolesDialog(),
        showNewRoleDialog: false,
    }),
    methods: {
        commit: async function () {
            await this.dialog.commit()
            this.display = false;
            this.$emit('completed');
        },
        changeDoamin: function () {
            this.table.domainId = this.dialog.domainId;
            this.table.refresh();
        }
    },
    created() {
    },
    watch: {
        display(newVal) {
            if (this.display) {
                this.dialog.init();
                this.table.domainId = this.dialog.domainId;
                this.table.refresh();
            }
            this.display = newVal;
            this.$emit("update:show", this.display);
        }
    },
};
</script>
