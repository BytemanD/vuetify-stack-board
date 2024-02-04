<template>
    <v-row>
        <v-col cols="12">
            <v-data-table show-expand single-expand show-select density='compact' :loading="table.loading"
                :headers="table.headers" :items="table.items" :items-per-page="table.itemsPerPage" :search="table.search"
                class="elevation-1" v-model="table.selected">
                <template v-slot:top>
                    <v-row>
                        <v-col cols="12" md="6" sm="12">
                            <v-toolbar density="compact" class="rounded-pill">
                                <NewVolumeType @completed="table.refresh()" />
                                <v-spacer></v-spacer>
                                <delete-comfirm-dialog :disabled="table.selected.length == 0" title="确定删除类型?"
                                    @click:comfirm="table.deleteSelected()" :items="table.getSelectedItems()" />
                            </v-toolbar>
                        </v-col>
                        <v-col>
                            <v-text-field density='compact' v-model="table.search" label="搜索" single-line
                                hide-details></v-text-field>
                        </v-col>
                        <v-col cols="1">
                            <v-btn color="info" variant="text" icon="mdi-refresh" v-on:click="table.refresh()"></v-btn>
                        </v-col>
                    </v-row>
                </template>

                <template v-slot:[`item.is_public`]="{ item }">
                    <v-icon v-if="item.is_public == true" color="success">mdi-check</v-icon>
                    <v-icon v-else color="red">mdi-close</v-icon>
                </template>

                <template v-slot:[`item.extra_specs`]="{ item }">
                    <v-chip label size="x-small" class="mr-1" v-for="(value, key) in item.extra_specs" v-bind:key="key">
                        {{ key }}={{ value }}</v-chip>
                </template>
                <template v-slot:expanded-row="{ columns, item }">
                    <td></td>
                    <td :colspan="columns.length - 1">
                        <tr v-for="extendItem in table.extendItems" v-bind:key="extendItem.text">
                            <td class="text-info">{{ extendItem.title }}:</td>
                            <td>{{ item[extendItem.title] }}</td>
                        </tr>
                    </td>
                </template>
            </v-data-table>
        </v-col>
    </v-row>
</template>

<script>
import { VolumeTypeTable } from '@/assets/app/tables.jsx';

import DeleteComfirmDialog from '@/components/plugins/dialogs/DeleteComfirmDialog.vue';
import NewVolumeType from './dialogs/NewVolumeType.vue';

export default {
    components: {
        NewVolumeType, DeleteComfirmDialog,
    },

    data: () => ({
        table: new VolumeTypeTable()
    }),
    methods: {

    },
    created() {
        this.table.refresh();
    }
};
</script>
    