<template>
    <v-dialog scrollable v-model="display" width="900">
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" color="primary" variant="text">用户管理</v-btn>
        </template>
        <v-card>
            <v-card-title>用户管理</v-card-title>
            <v-card-text>
                <v-data-table density='compact' show-select :headers="dialog.table.headers" :items="dialog.table.items"
                    :search="dialog.table.search" :items-per-page="dialog.table.itemsPerPage"
                    v-model="dialog.table.selected">

                    <template v-slot:top>
                        <v-row>
                            <v-col>
                                <v-toolbar density="compact" class="rounded-pill">
                                    <v-spacer></v-spacer>
                                    <delete-comfirm-dialog :disabled="dialog.table.selected.length == 0" title="确定删除用户?"
                                        @click:comfirm="dialog.table.deleteSelected()" :items="dialog.table.getSelectedItems()"/>
                                </v-toolbar>
                            </v-col>
                            <v-col>
                                <v-text-field density='compact' single-line hide-details v-model="dialog.table.search"
                                    label="搜索"></v-text-field>
                            </v-col>
                        </v-row>
                    </template>
                </v-data-table>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>
    
<script>
import { UsersDialog } from '@/assets/app/dialogs';

import DeleteComfirmDialog from '@/components/plugins/dialogs/DeleteComfirmDialog.vue';

export default {
    components: {
        DeleteComfirmDialog
    },
    props: {
    },
    data: () => ({
        display: false,
        dialog: new UsersDialog(),
    }),
    methods: {
        commit: async function () {
            await this.dialog.commit()
            this.display = false;
            this.$emit('completed');
        }
    },
    created() {

    },
    watch: {
        display(newVal) {
            if (this.display) {
                this.dialog.init();
            }
            this.display = newVal;
            this.$emit("update:show", this.display);
        }
    },
};
</script>
