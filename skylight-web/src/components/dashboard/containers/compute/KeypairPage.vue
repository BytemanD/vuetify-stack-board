<template>
    <v-row>
        <v-col cols="12">
            <v-data-table show-select density='compact' show-expand single-expand :loading="table.loading"
                :headers="table.headers" item-value="name" :items="table.items" :items-per-page="table.itemsPerPage"
                :search="table.search" v-model="table.selected">

                <template v-slot:top>
                    <v-row>
                        <v-col cols="12" md="7" sm="12">
                            <v-toolbar density="compact" class="rounded-pill">
                                <NewKeypairDialog @completed='table.refresh()' />
                                <v-spacer></v-spacer>
                                <delete-comfirm-dialog :disabled="table.selected.length == 0" title="确定删除密钥对?"
                                    @click:comfirm="table.deleteSelected()" :items="table.getSelectedItems()" />
                            </v-toolbar>
                        </v-col>
                        <v-col>
                            <v-text-field small density='compact' v-model="table.search" label="搜索" single-line
                                hide-details></v-text-field>
                        </v-col>
                        <v-col cols="1" class="text-center">
                            <v-btn variant="text" icon="mdi-refresh" color="info"
                                @click="table.refresh()"><v-icon>mdi-refresh</v-icon></v-btn>
                        </v-col>
                    </v-row>
                </template>

                <template v-slot:[`item.name`]="{ item }">
                    {{ item.name }}
                    <v-btn size="small" color="info" :text="$t('copy')" variant="text"
                        @click="Utils.copyContent(item.public_key, '公钥内容已复制')"></v-btn>
                </template>
                <template v-slot:expanded-row="{ columns, item }">
                    <td></td>
                    <td :colspan="columns.length - 1">
                        <v-textarea hide-details filled readonly v-model="item.public_key"></v-textarea>
                    </td>
                </template>
            </v-data-table>
        </v-col>
    </v-row>
</template>

<script>

import { KeypairDataTable } from '@/assets/app/tables.jsx';
import { Utils } from '@/assets/app/lib.js';

import DeleteComfirmDialog from '@/components/plugins/dialogs/DeleteComfirmDialog.vue';
import NewKeypairDialog from './dialogs/NewKeypairDialog.vue';

export default {
    components: {
        NewKeypairDialog, DeleteComfirmDialog
    },

    data: () => ({
        Utils: Utils,
        table: new KeypairDataTable(),
    }),
    methods: {

    },
    created() {
        this.table.refresh();
    }
};
</script>
