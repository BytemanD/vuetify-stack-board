<template>
    <v-dialog scrollable v-model="display" width="900">
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" color="primary" variant="text">用户管理</v-btn>
        </template>
        <v-card>
            <v-card-title class="headline primary lighten-2" primary-title>用户管理</v-card-title>
            <v-card-text>
                <v-row>
                    <v-col>
                        <v-btn color="red" @click="dialog.table.deleteSelected()">删除</v-btn>
                    </v-col>
                    <v-col>
                        <v-text-field density='compact' single-line hide-details v-model="dialog.table.search" 
                            label="搜索"></v-text-field>
                    </v-col>
                </v-row>
                <v-data-table density='compact' show-select :headers="dialog.table.headers" :items="dialog.table.items" :search="dialog.table.search"
                    :items-per-page="dialog.table.itemsPerPage" v-model="dialog.table.selected">
                </v-data-table>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>
    
<script>
import { UsersDialog } from '@/assets/app/dialogs';

export default {
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
