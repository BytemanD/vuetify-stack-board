<template>
    <v-row>
        <v-col>
            <v-btn small color="primary" @click="newNetDialog.open()"><v-icon>mdi-plus</v-icon> 新建网络</v-btn>
            <v-btn small color="error" v-on:click="table.deleteSelected()">删除</v-btn>
            <v-btn small color="primary" @click="newSubnetDialog.open()">新建子网</v-btn>
        </v-col>
        <v-col>
            <v-text-field small dense v-model="table.search" append-icon="mdi-magnify" label="搜索" single-line
                hide-details></v-text-field>
        </v-col>
        <v-col cols="1" class="text-center">
            <v-btn fab x-small color="info" v-on:click="table.refresh()"><v-icon>mdi-refresh</v-icon></v-btn>
        </v-col>
        <v-col cols="12">
            <v-data-table show-select show-expand single-expand dense :headers="table.headers" :items="table.items"
                :items-per-page="table.itemsPerPage" :search="table.search" v-model="table.selected">

                <template v-slot:[`item.status`]="{ item }">
                    <v-icon v-if="item.status == 'ACTIVE'" color="success">mdi-emoticon-happy</v-icon>
                    <v-icon v-else color="error">mdi-emoticon-sad</v-icon>
                </template>
                <template v-slot:[`item.admin_state_up`]="{ item }">
                    <v-switch class="my-auto" color="success" v-model="item.admin_state_up" hide-details
                        @click="table.adminStateDown(item)"></v-switch>
                </template>
                <template v-slot:[`item.shared`]="{ item }">
                    <v-switch class="my-auto" v-model="item.shared" hide-details @click="table.shared(item)"></v-switch>
                </template>
                <template v-slot:[`item.subnets`]="{ item }">
                    <template v-for="subnet_id in item.subnets">
                        <v-chip close x-small label color="cyan" v-bind:key="subnet_id"
                            @click:close="table.deleteSubnet(subnet_id)" text-color="white" class="mr-1"
                            v-if="table.subnets[subnet_id]">
                            {{ table.subnets[subnet_id].cidr }}
                        </v-chip>
                    </template>
                </template>
                <template v-slot:expanded-item="{ headers, item }">
                    <td></td>
                    <td :colspan="headers.length - 1">
                        <table>
                            <tr v-for="extendItem in table.extendItems" v-bind:key="extendItem.text">
                                <td><strong>{{ extendItem.text }}:</strong> </td>
                                <td>{{ item[extendItem.value] }}</td>
                            </tr>
                        </table>
                    </td>
                </template>
            </v-data-table>
        </v-col>
    </v-row>
</template>

<script>
import { NetDataTable } from '@/assets/app/tables';

export default {
    components: {

    },
    data: () => ({
        table: new NetDataTable()
    }),
    methods: {

    },
    created() {
        this.table.refresh();
    }
};
</script>
