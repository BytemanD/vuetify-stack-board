<template>
    <v-row>
        <v-col cols="12">
            <v-btn-toggle mandatory v-model="displayType" variant="outlined" color="info">
                <v-btn icon="mdi-table"></v-btn>
                <v-btn icon="mdi-chart-tree" @click="drawAz()"></v-btn>
            </v-btn-toggle>
        </v-col>
        <v-col cols="12" :hidden="displayType != 0">
            <v-data-table density='compact' :loading="table.loading" 
                :headers="table.headers" :items="table.azMap[table.zoneName].hosts" :items-per-page="table.itemsPerPage"
                :search="table.search" v-model="table.selected">

                <template v-slot:top>
                    <v-row>
                        <v-col cols="12" md="4" sm="12"></v-col>
                        <v-col cols="12" md="3" sm="12">
                            <v-select prefix="AZ:" density='compact' :items="Object.keys(table.azMap)"
                                v-model="table.zoneName"></v-select>
                        </v-col>
                        <v-col>
                            <v-text-field small density='compact' single-line hide-details v-model="table.search"
                                label="搜索"></v-text-field>
                        </v-col>
                        <v-col cols="1" class="text-center">
                            <v-btn color="info" icon="mdi-refresh" variant="text" v-on:click="table.refresh()"></v-btn>
                        </v-col>
                    </v-row>
                </template>

                <template v-slot:[`item.active`]="{ item }">
                    <v-icon v-if="item.active" color="success">mdi-emoticon-happy</v-icon>
                    <v-icon v-else color="red">mdi-emoticon-sad</v-icon>
                </template>
                <template v-slot:[`item.available`]="{ item }">
                    <v-icon v-if="item.available" color="success">mdi-emoticon-happy</v-icon>
                    <v-icon v-else color="red">mdi-emoticon-sad</v-icon>
                </template>
            </v-data-table>
        </v-col>
        <v-col cols="12" :hidden="displayType != 1">
            <v-card   variant="tonal">
                <v-card-text >
                    <div id="azTopolopy" style="height: 300px;"></div>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script>
import { AZDataTable } from '@/assets/app/tables.jsx';
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
        drawAz: async function () {
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
