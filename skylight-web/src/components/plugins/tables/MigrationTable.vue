<template>
    <v-row>
        <v-col>
            <v-data-table density='compact' show-expand single-expand :loading="table.loading" :headers="table.headers"
                :items="table.items" :items-per-page="table.itemsPerPage" :search="table.search" v-model="table.selected">

                <template v-slot:top>
                    <v-row>
                        <v-col></v-col>
                        <v-col cols="12" md="4" lg="3" class="my-auto text-center">
                            <v-spacer></v-spacer>
                            <v-select v-model="table.migrationType" density="compact" clearable hide-details
                                placeholder="选择类型"
                                :items="table.migrationTypes" @update:model-value="table.refresh()">
                                <template v-slot:prepend>类型</template>
                            </v-select>
                        </v-col>
                        <v-col cols="11" md="5" lg="5">
                            <v-text-field small density='compact' v-model="table.search" label="搜索" single-line
                                hide-details></v-text-field>
                        </v-col>
                        <v-col cols="1" class="text-center" v-if="refreshBtn">
                            <v-btn variant="text" icon="mdi-refresh" color="info" v-on:click="table.refresh()"></v-btn>
                        </v-col>
                    </v-row>
                </template>

                <template v-slot:[`item.status`]="{ item }">
                    <span class="text-red" v-if="item.status == 'failed'">{{ item.status }}</span>
                    <span class="text-red" v-else-if="item.status == 'error'">{{ item.status }}</span>
                    <span class="text-green" v-else-if="item.status == 'completed'">{{ item.status }}</span>
                    <span v-else>{{ item.status }}</span>
                </template>
                <template v-slot:[`item.created_at`]="{ item }">
                    <span small>{{ Utils.parseUTCToLocal(item.created_at) }}</span>
                </template>
                <template v-slot:expanded-row="{ columns, item }">
                    <td :colspan="columns.length - 2">
                        <table class="ml-10">
                            <tr v-for="extendItem in table.extendItems" v-bind:key="extendItem.title">
                                <td><strong>{{ extendItem.title }}:</strong></td>
                                <td>
                                    <span v-if="extendItem.key == 'updated_at'">
                                        {{ Utils.parseUTCToLocal(item.updated_at) }}
                                    </span>
                                    <span v-else>{{ item[extendItem.key] }}</span>
                                </td>
                            </tr>
                        </table>
                    </td>
                </template>
            </v-data-table>
        </v-col>
    </v-row>
</template>

<script setup>
import { defineProps } from 'vue';
import { Utils } from '@/assets/app/lib.js';

const progs = defineProps({
    table: { type: Object, required: true, },
    refreshBtn: { type: Boolean, default: false, },
})

</script>
