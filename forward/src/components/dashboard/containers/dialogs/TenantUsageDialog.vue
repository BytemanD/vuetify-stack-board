<template>
    <v-dialog v-model="display" width="1200" scrollable>
        <v-card>
            <v-card-title class="headline grey lighten-4" primary-title>
                <v-row>
                    <v-col lg="6">
                        <v-select hide-details dense :items="tenantUsageDialog.dateRangeList" prepend-icon="mdi-calendar"
                            v-model="tenantUsageDialog.dateRange" v-on:change="tenantUsageDialog.refresh()">
                        </v-select>
                    </v-col>
                    <v-col cols="1">
                        <v-btn icon color="primary" @click="tenantUsageDialog.refresh()"><v-icon>mdi-refresh</v-icon></v-btn>
                    </v-col>
                </v-row>
            </v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="6">
                        <v-card outlined><div id="vcpuUsage" style="height:260px;" ></div></v-card>
                    </v-col>
                    <v-col cols="6">
                        <v-card outlined><div id="memUsage" style="height:260px;"></div></v-card>
                    </v-col>
                    <v-col cols="6">
                        <v-card outlined><div id="diskUsage" style="height:260px;"></div></v-card>
                    </v-col>
                    <v-col cols="6">
                        <v-card outlined><div id="serverUsage" style="height:260px;"></div></v-card>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
import i18n from '@/assets/app/i18n';
import { TenantUsageDialog } from '@/assets/app/dialogs';

export default {
    props: {
        show: Boolean,
    },
    data: () => ({
        i18n: i18n,
        display: false,
        tenantUsageDialog: new TenantUsageDialog(),
        windowsSize: {},
    }),
    methods: {

    },
    created() {
        this.tenantUsageDialog._setDateRangeList();
        this.tenantUsageDialog.refresh();
    },
    watch: {
        show(newVal) {
            console.log('show -->', newVal)
            this.display = newVal;
        },
        display(newVal) {
            this.display = newVal;
            this.$emit("update:show", this.display);
        }
    },
};
</script>