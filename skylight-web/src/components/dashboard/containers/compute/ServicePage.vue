<template>
    <v-row>
        <v-col cols="12">
            <v-data-table density='compact' :loading="table.loading" :headers="table.headers" show-select
                :items="table.items" :items-per-page="table.itemsPerPage" :search="table.search" class="elevation-1"
                v-model="table.selected">
                <template v-slot:top>
                    <v-row>
                        <v-col cols="12" md="7" sm="12">
                            <v-toolbar density="compact" class="rounded-pill">
                                <v-spacer></v-spacer>
                                <delete-comfirm-dialog :disabled="table.selected.length == 0" title="确定删除计算服务?"
                                    @click:comfirm="table.deleteSelected()"
                                    :item-value-func="(item) => { return item.binary + '@' + item.host }"
                                    :items="table.getSelectedItems()" />
                            </v-toolbar>
                        </v-col>
                        <v-col>
                            <v-text-field density='compact' single-line hide-details v-model="table.search"
                                label="搜索"></v-text-field>
                        </v-col>
                        <v-col cols="1" class="text-center">
                            <v-btn color="info" icon="mdi-refresh" variant="text" v-on:click="table.refresh()"></v-btn>
                        </v-col>
                    </v-row>
                </template>

                <template v-slot:[`item.status`]="{ item }">
                    <v-switch v-if="item.status == 'enabled'" class="my-auto" hide-details color="success"
                        true-value="enabled" false-value="disabled" v-model="item.status"
                        :disabled="item.binary != 'nova-compute'" @click="table.toggleEnable(item)"></v-switch>
                    <v-tooltip location="top" v-else>
                        <template v-slot:activator="{ props }">
                            <v-switch v-bind="props" class="my-auto" hide-details color="success" true-value="enabled"
                                false-value="disabled" v-model="item.status" :disabled="item.binary != 'nova-compute'"
                                @click="table.toggleEnable(item)"></v-switch>
                        </template>
                        {{ item.disabled_reason || '未知' }}
                    </v-tooltip>
                </template>
                <template v-slot:[`item.forced_down`]="{ item }">
                    <v-switch class="my-auto" v-model="item.forced_down" hide-details color="warning"
                        :disabled="item.binary != 'nova-compute'" @click="table.forceDown(item)"></v-switch>
                </template>
                <template v-slot:[`item.state`]="{ item }">
                    <v-icon v-if="item.state == 'up'" color="success">mdi-emoticon-happy</v-icon>
                    <v-icon v-else color="red">mdi-emoticon-sad</v-icon>
                </template>
            </v-data-table>
        </v-col>
    </v-row>
</template>

<script>
import { Utils } from '@/assets/app/lib.js';
import { ComputeServiceTable } from '@/assets/app/tables.jsx';

import DeleteComfirmDialog from '@/components/plugins/dialogs/DeleteComfirmDialog.vue';

export default {
    components: {
        DeleteComfirmDialog,
    },

    data: () => ({
        Utils: Utils,
        table: new ComputeServiceTable()

        // miniVariant: false,
    }),
    methods: {

    },
    created() {
        this.table.refresh();
    }
};
</script>
