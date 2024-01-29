<template>
    <v-row>
        <v-col cols="12">
            <v-data-table show-expand single-expand density='compact' :loading="table.loading" :headers="table.headers"
                :items="table.items" :items-per-page="table.itemsPerPage" :search="table.search" v-model="table.selected">

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
                <template v-slot:[`item.status`]="{ item }">
                    <v-icon v-if="item.status == 'enabled'" color="success">mdi-check</v-icon>
                    <span v-else>{{ item.status }}</span>
                </template>
                <template v-slot:[`item.state`]="{ item }">
                    <v-icon v-if="item.state == 'up'" color="success">mdi-emoticon-happy</v-icon>
                    <v-icon v-else color="red">mdi-emoticon-sad</v-icon>
                </template>
                <template v-slot:[`item.image_name`]="{ item }">
                    <v-chip x-small label v-if="item.volume_image_metadata">{{ item.volume_image_metadata.image_name
                    }}</v-chip>
                </template>

                <template v-slot:expanded-row="{ columns, item }">
                    <td :colspan="columns.length - 1" class="pl-10">
                        <table>
                            <tr v-for="extendItem in table.extendItems" v-bind:key="extendItem.title">
                                <td class="text-info">{{ extendItem.title }}:</td>
                                <td>{{ item[extendItem.title] }}</td>
                            </tr>
                        </table>
                    </td>
                </template>
            </v-data-table>
        </v-col>
    </v-row>
</template>

<script>
import { VolumeServiceTable } from '@/assets/app/tables.jsx';

export default {
    components: {

    },

    data: () => ({
        table: new VolumeServiceTable()
        // miniVariant: false,
    }),
    methods: {

    },
    created() {
        this.table.refresh();
    }
};
</script>
    