<template>
    <v-row>
        <v-col cols="12">
            <v-data-table show-expand single-expand density='compact' :loading="table.loading" :headers="table.headers"
                :items="table.items" :items-per-page="table.itemsPerPage" :search="table.search" class="elevation-1"
                v-model="table.selected">

                <template v-slot:top>
                    <v-row>
                        <v-col cols="12" md="6" sm="12"></v-col>
                        <v-col>
                            <v-text-field density='compact' v-model="table.search" label="搜索" single-line
                                hide-details></v-text-field>
                        </v-col>
                        <v-col cols="1" class="text-center">
                            <v-btn color="info" icon="mdi-refresh" variant="text" v-on:click="table.refresh()"></v-btn>
                        </v-col>
                    </v-row>
                </template>

                <template v-slot:[`item.volume_backend_name`]="{ item }">
                    {{ item.capabilities.volume_backend_name }}
                </template>
                <template v-slot:[`item.capacity_gb`]="{ item }">
                    <v-tooltip bottom>
                        <template v-slot:activator="{ props }">
                            <v-progress-linear v-bind="props" height="12" color="info" rounded
                                :max="item.capabilities.total_capacity_gb"
                                :model-value="item.capabilities.total_capacity_gb - item.capabilities.free_capacity_gb">
                            </v-progress-linear>
                        </template>
                        总容量: {{ item.capabilities.total_capacity_gb }} <br>剩余容量: {{ item.capabilities.free_capacity_gb }}
                    </v-tooltip>

                </template>
                <template v-slot:[`item.provisioned_capacity_gb`]="{ item }">
                    {{ item.capabilities.provisioned_capacity_gb }}
                </template>
                <template v-slot:[`item.allocated_capacity_gb`]="{ item }">
                    {{ item.capabilities.allocated_capacity_gb }}
                </template>
                <template v-slot:[`item.storage_protocol`]="{ item }">
                    {{ item.capabilities.storage_protocol }}
                </template>

                <template v-slot:expanded-row="{ columns, item }">
                    <td :colspan="columns.length - 1">
                        <table class="ml-10">
                            <tr v-for="(value, key) in item.capabilities" v-bind:key="key">
                                <template v-if="table.columns.indexOf(key) < 0">
                                    <td><strong>{{ key }}: </strong></td>
                                    <td>{{ value }}</td>
                                </template>
                            </tr>
                        </table>
                    </td>

                </template>
            </v-data-table>
        </v-col>
    </v-row>
</template>

<script>
import { VolumePoolTable } from '@/assets/app/tables.jsx';

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
    