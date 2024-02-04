<template>
    <v-dialog scrollable v-model="display" width="1000">
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" color="primary" variant="text">{{ $t('service') }}</v-btn>
        </template>
        <v-card>
            <v-card-title class="headline primary lighten-2" primary-title>服务管理</v-card-title>
            <v-card-text>
                <v-data-table density='compact' show-select class="mt-1" :loading="dialog.serviceTable.loading"
                    :headers="dialog.serviceTable.headers" :items="dialog.serviceTable.items"
                    :items-per-page="dialog.serviceTable.itemsPerPage" :search="dialog.serviceTable.search"
                    v-model="dialog.serviceTable.selected">
                    <template v-slot:top>
                        <v-row>
                            <v-col cols="6">
                                <v-toolbar density="compact" class="rounded-pill">
                                    <!-- TODO -->
                                    <v-btn color="primary" icon="mdi-plus"></v-btn>
                                    <v-spacer></v-spacer>
                                    <delete-comfirm-dialog :disabled="dialog.serviceTable.selected.length == 0" title="确定删除安全组?"
                                        @click:comfirm="dialog.serviceTable.deleteSelected()"
                                        :items="dialog.serviceTable.getSelectedItems()" />
                                </v-toolbar>
                            </v-col>
                            <v-col>
                                <v-text-field density='compact' single-line hide-details small
                                    v-model="dialog.serviceTable.search" label="搜索"></v-text-field>
                            </v-col>
                            <v-col cols="1">
                                <v-btn color="info" icon="mdi-refresh" variant="text"
                                    v-on:click="dialog.serviceTable.refresh()"><v-icon>mdi-refresh</v-icon></v-btn>
                            </v-col>
                        </v-row>
                    </template>
                </v-data-table>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
import i18n from '@/assets/app/i18n';
import { Utils } from '@/assets/app/lib';
import { ServiceDialog } from '@/assets/app/dialogs';

import DeleteComfirmDialog from '@/components/plugins/dialogs/DeleteComfirmDialog.vue';

export default {
    components: {
        DeleteComfirmDialog
    },
    props: {
    },
    data: () => ({
        i18n: i18n,
        display: false,
        Utils: Utils,
        dialog: new ServiceDialog(),
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
