<template>
    <v-row>
        <v-col>
        </v-col>
        <v-col>
            <v-text-field small dense v-model="table.search" append-icon="mdi-magnify" label="搜索" single-line
                hide-details></v-text-field>
        </v-col>
        <v-col cols="1" class="text-center">
            <v-btn fab x-small color="info" v-on:click="table.refresh()"><v-icon>mdi-refresh</v-icon></v-btn>
        </v-col>

        <v-col cols="12">
            <v-data-table show-expand single-expand show-select dense :loading="table.loading" :headers="table.headers" :items="table.items"
                :items-per-page="table.itemsPerPage" :search="table.search" class="elevation-1" v-model="table.selected">

                <template v-slot:[`item.volume_backend_name`]="{ item }">
                    {{ item.capabilities.volume_backend_name}}
                </template>
                <template v-slot:[`item.capacity_gb`]="{ item }">
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                        <v-sheet color="grey lighten-1" v-bind="attrs" v-on="on">
                            <v-progress-linear height="20"
                                :value="(item.capabilities.total_capacity_gb - item.capabilities.free_capacity_gb) * 100 / item.capabilities.total_capacity_gb">
                            </v-progress-linear>
                        </v-sheet>
                        </template>
                        总容量: {{ item.capabilities.total_capacity_gb }} <br>剩余容量: {{ item.capabilities.free_capacity_gb }}
                    </v-tooltip>
                    
                </template>
                <template v-slot:[`item.provisioned_capacity_gb`]="{ item }">
                    {{ item.capabilities.provisioned_capacity_gb}}
                </template>
                <template v-slot:[`item.allocated_capacity_gb`]="{ item }">
                    {{ item.capabilities.allocated_capacity_gb}}
                </template>
                <template v-slot:[`item.storage_protocol`]="{ item }">
                    {{ item.capabilities.storage_protocol}}
                </template>

                <template v-slot:expanded-item="{ headers, item }">
                    <td></td>
                    <td :colspan="headers.length - 1">
                        <tr v-for="(value, key) in item.capabilities" v-bind:key="key">
                            <template v-if="table.columns.indexOf(key) < 0">
                                <td class="info--text">{{key }}:</td>
                                <td>{{ value }}</td>
                            </template>
                        </tr>
                    </td>
                </template>
            </v-data-table>
        </v-col>
    </v-row>
</template>

<script>
import { VolumePoolTable } from '@/assets/app/tables.js';


export default {
    components: {

    },

    data: () => ({
        table: new VolumePoolTable()
    }),
    methods: {

    },
    created() {
        this.table.refresh();
    }
};
</script>
    