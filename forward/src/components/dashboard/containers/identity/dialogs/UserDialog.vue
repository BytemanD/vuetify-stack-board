<template>
    <v-dialog scrollable v-model="display" width="900">
        <v-card>
            <v-card-title class="headline grey lighten-2" primary-title>用户管理</v-card-title>
            <v-card-text>
                <v-row class="mt-1">
                    <v-col>
                        <v-btn small color="error" @click="dialog.table.deleteSelected()">删除</v-btn>
                    </v-col>
                    <v-col>
                        <v-text-field small dense single-line hide-details v-model="dialog.table.search" append-icon="mdi-magnify"
                            label="搜索"></v-text-field>
                    </v-col>
                </v-row>
                <v-data-table dense show-select :headers="dialog.table.headers" :items="dialog.table.items" :search="dialog.table.search"
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
        show: Boolean,
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
        show(newVal) {
            this.display = newVal;
            if (this.display) {
                this.dialog.init();
            }
        },
        display(newVal) {
            this.display = newVal;
            this.$emit("update:show", this.display);
        }
    },
};
</script>
