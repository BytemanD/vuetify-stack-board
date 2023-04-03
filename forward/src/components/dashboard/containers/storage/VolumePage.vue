<template>
    <v-row>
        <v-col>
            <v-btn x-small fab class="mr-1" color="primary" @click="openNewVolumeDialog = !openNewVolumeDialog"><v-icon small>mdi-plus</v-icon></v-btn>
            <v-btn small color="warning" class="mr-1" @click="openNewVolumeStatusResetDiaog = true" :disabled="table.selected.length == 0">状态重置</v-btn>
            <v-btn small color="error" @click="table.deleteSelected()" :disabled="table.selected.length == 0">
                <v-icon small>mdi-trash-can</v-icon>删除</v-btn>
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
                :items-per-page="table.itemsPerPage" :search="table.search" class="elevation-1" v-model="table.selected" >
                <template v-slot:[`item.status`]="{ item }">
                    <span>
                        <v-icon v-if="item.status == 'available'">mdi-link-variant-off</v-icon>
                        <v-icon v-else-if="item.status == 'in-use'" color="success">mdi-link-variant</v-icon>
                        <v-icon v-else-if="item.status == 'error'" color="error">mdi-close-circle</v-icon>
                        <v-tooltip top v-else-if="table.isDoing(item)">
                            <template v-slot:activator="{ on, attrs }">
                                <v-icon color="warning" class="mdi-spin" v-bind="attrs" v-on="on">mdi-rotate-right</v-icon>
                            </template>
                            {{ item.status }}
                        </v-tooltip>
                        <v-tooltip top v-else>
                            <template v-slot:activator="{ on, attrs }">
                                <v-icon color="error" v-bind="attrs" v-on="on">mdi-alert-outline</v-icon>
                            </template>
                            {{ item.status }}
                        </v-tooltip>
                        <v-chip v-if="item.bootable == 'true'" x-small outlined color="info">启动盘</v-chip>
                        <v-chip v-if="item.multiattach == 'true'" x-small outlined color="info">共享</v-chip>
                    </span>
                </template>
                <template v-slot:[`item.image_name`]="{ item }">
                    <v-chip x-small label v-if="item.volume_image_metadata">{{ item.volume_image_metadata.image_name }}</v-chip>
                </template>
    
                <template v-slot:expanded-item="{ headers, item }">
                    <td></td>
                    <td :colspan="headers.length - 1">
                        <table>
                            <tr v-for="extendItem in table.extendItems" v-bind:key="extendItem.text">
                                <td class="info--text">{{ extendItem.text }}:</td>
                                <td>{{ item[extendItem.value] }}</td>
                            </tr>
                        </table>
                    </td>
                </template>
            </v-data-table>
        </v-col>
        <v-col cols="12">
            <NewVolumeVue :show.sync="openNewVolumeDialog" @completed="table.refresh()"/>
            <VolumeStatusResetDialog :volumes="table.selected" :show.sync="openNewVolumeStatusResetDiaog" @completed="table.refresh()"/>
        </v-col>
    </v-row>
</template>

<script>
import { VolumeDataTable } from '@/assets/app/tables.js';
import { Utils } from '@/assets/app/lib.js';

import NewVolumeVue from './dialogs/NewVolume.vue';
import VolumeStatusResetDialog from './dialogs/VolumeStatusResetDialog.vue';


export default {
    components: {
        NewVolumeVue, VolumeStatusResetDialog,
    },

    data: () => ({
        Utils: Utils,
        openNewVolumeDialog: false,
        openNewVolumeStatusResetDiaog: false,
        table: new VolumeDataTable(),
    }),
    methods: {

    },
    created() {
        this.table.refresh();
    }
};
</script>
    