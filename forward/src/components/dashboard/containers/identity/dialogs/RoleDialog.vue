<template>
    <v-dialog scrollable v-model="display" width="900">
        <v-card>
            <v-card-title class="headline primary lighten-2" primary-title>角色管理</v-card-title>
            <v-card-text>
                <v-row class="mt-1">
                    <v-col>
                        <v-btn x-small fab class='mr-1' color="primary"
                            @click="showRoleDialog = !showRoleDialog"><v-icon>mdi-plus</v-icon></v-btn>
                        <v-btn small color="error" @click="table.deleteSelected()"
                            :disabled="table.selected.length == 0">删除</v-btn>
                    </v-col>
                    <v-col>
                        <v-select dense outlined :items="dialog.domains" clearable label="Domain" item-text="name"
                            item-value="id" v-model="dialog.domainId" v-on:change="changeDoamin()">
                        </v-select>
                    </v-col>
                    <v-col cols="1">
                        <v-btn fab x-small color="info" v-on:click="table.refresh()"><v-icon>mdi-refresh</v-icon></v-btn>
                    </v-col>
                </v-row>
                <v-data-table :headers="table.headers" :items="table.items" :items-per-page="table.itemsPerPage"
                    :search="table.search" dense show-select v-model="table.selected">
                </v-data-table>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>
    
<script>
import { RoleTable } from '@/assets/app/tables';
import { RolesDialog } from '@/assets/app/dialogs';

export default {
    props: {
        show: Boolean,
    },
    data: () => ({
        display: false,
        table: new RoleTable(),
        dialog: new RolesDialog(),
        showRoleDialog: false,
    }),
    methods: {
        commit: async function () {
            await this.dialog.commit()
            this.display = false;
            this.$emit('completed');
        },
        changeDoamin: function(){
            this.table.domainId = this.dialog.domainId;
            this.table.refresh();
        }
    },
    created() {
    },
    watch: {
        show(newVal) {
            this.display = newVal;
            if (this.display) {
                this.dialog.init();
                this.table.domainId = this.dialog.domainId;
                this.table.refresh();
            }
        },
        display(newVal) {
            this.display = newVal;
            this.$emit("update:show", this.display);
        }
    },
};
</script>
