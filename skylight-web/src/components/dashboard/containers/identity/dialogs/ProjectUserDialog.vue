<template>
    <v-dialog v-model="display" width="800" scrollable>
        <v-card>
            <v-card-title class="headline primary" primary-title>用户列表</v-card-title>
            <v-card-text>
                <v-row>
                    <v-col>
                        <v-btn class="mr-1 mt-1" color="primary"
                            @click="showNewUserDialog = !showNewUserDialog"><v-icon>mdi-plus</v-icon>
                        </v-btn>
                        <v-btn color="red" @click="dialog.deleteSelected()"
                            :disabled="dialog.userTable.selected.length == 0">删除</v-btn>
                    </v-col>
                    <v-col cols="2">
                        <v-btn fab x-small color="info"
                            v-on:click="dialog.refresh()"><v-icon>mdi-refresh</v-icon></v-btn>
                    </v-col>
                </v-row>
                <v-data-table :headers="dialog.userTable.headers" :loading="dialog.userTable.loading"
                    :items="dialog.userTable.items" :items-per-page="dialog.userTable.itemsPerPage"
                    :search="dialog.userTable.search" density='compact' show-select v-model="dialog.userTable.selected">
                </v-data-table>
            </v-card-text>
        </v-card>
        <NewUserDialogPage :show.sync="showNewUserDialog" :project="project" />
    </v-dialog>
</template>

<script>
import { ProjectUserDialog } from '@/assets/app/dialogs';
import NewUserDialogPage from './NewUserDialogPage.vue';

export default {
    components: {
        NewUserDialogPage,
    },
    props: {
        show: Boolean,
        project: Object,
    },
    data: () => ({
        name: 'xxxx',
        display: false,
        dialog: new ProjectUserDialog(),
        showNewUserDialog: false,
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
                this.dialog.init(this.project);
            }
        },
        display(newVal) {
            this.display = newVal;
            this.$emit("update:show", this.display);
        }
    },
};
</script>
