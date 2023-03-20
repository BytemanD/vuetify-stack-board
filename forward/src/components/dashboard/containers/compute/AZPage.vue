<template>
    <v-row>
        <v-col cols="6">
            <v-btn-toggle mandatory v-model="displayType">
                <v-btn small><v-icon>mdi-table</v-icon></v-btn>
                <v-btn small @click="drawAz()"><v-icon>mdi-chart-tree</v-icon></v-btn>
            </v-btn-toggle>
        </v-col>
        <v-col :hidden="displayType != 0">
            <v-row>
                <v-col>
                    <v-select solo dense :items="Object.keys(table.azMap)" label="AZ" v-model="table.zoneName"></v-select>
                </v-col>
                <v-col>
                    <v-text-field small solo dense hide-details v-model="table.search" 
                        append-icon="mdi-magnify" label="搜索"></v-text-field>
                </v-col>
                <v-col cols="2" class="text-center">
                    <v-btn fab x-small color="info" @click="table.refresh()"><v-icon>mdi-refresh</v-icon></v-btn>
                </v-col>
            </v-row>
        </v-col>
        <v-col cols="12">
            <v-data-table dense show-select :loading="table.loading" :hidden="displayType != 0" :headers="table.headers" :items="table.azMap[table.zoneName].hosts"
                :items-per-page="table.itemsPerPage" :search="table.search" class="elevation-1" 
                v-model="table.selected">
                <template v-slot:[`item.active`]="{ item }">
                    <v-icon v-if="item.active" color="success">mdi-emoticon-happy</v-icon>
                    <v-icon v-else color="error">mdi-emoticon-sad</v-icon>
                </template>
                <template v-slot:[`item.available`]="{ item }">
                    <v-icon v-if="item.available" color="success">mdi-emoticon-happy</v-icon>
                    <v-icon v-else color="error">mdi-emoticon-sad</v-icon>
                </template>
            </v-data-table>
        </v-col>
        <v-col :hidden="displayType != 1" cols="12">
            <v-card>
                <v-card-text>
                    <div id="azTopolopy" style="height:400px;"></div>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script>
import { AZDataTable } from '@/assets/app/tables.js';
import { Utils } from '@/assets/app/lib.js';

export default {
    components: {

    },

    data: () => ({
        Utils: Utils,
        displayType: 0,
        table: new AZDataTable()
    }),
    methods: {
        drawAz: async function(){
            // TODO: 需要等一会儿，否则不会显示，是否有更好的方法？
            await Utils.sleep(1);
            // await this.table.refresh();
            this.table.drawTopoloy('azTopolopy');
        }
    },
    created() {
        this.table.refresh();
    }
};
</script>
