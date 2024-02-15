<template>
    <v-row>
        <v-col cols="12" lg="6">
            <v-breadcrumbs :items="breadcrumbItems" color="info">
                <template v-slot:divider>
                    <v-icon icon="mdi-chevron-right"></v-icon>
                </template>
            </v-breadcrumbs>
        </v-col>
        <v-col cols="8" sm="8" lg="4">
            <v-select hide-details density='compact' :items="tenantUsageDialog.dateRangeList" prepend-icon="mdi-calendar"
                item-title="text" item-value="value" v-model="tenantUsageDialog.dateRange"
                v-on:update:model-value="tenantUsageDialog.refresh()">
            </v-select>
        </v-col>
        <v-col cols="4" sm="4" lg="2" class="text-right">
            <v-btn size="small" icon="mdi-refresh" color="primary" @click="tenantUsageDialog.refresh()"></v-btn>
        </v-col>
        <v-col cols="12" lg="6">
            <v-card elevation="4">
                <div id="vcpuUsage" style="height:260px;"></div>
            </v-card>
        </v-col>
        <v-col cols="12" lg="6">
            <v-card elevation="4">
                <div id="memUsage" style="height:260px;"></div>
            </v-card>
        </v-col>
        <v-col cols="12" lg="6">
            <v-card elevation="4">
                <div id="diskUsage" style="height:260px;"></div>
            </v-card>
        </v-col>
        <v-col cols="12" lg="6">
            <v-card elevation="4">
                <div id="serverUsage" style="height:260px;"></div>
            </v-card>
        </v-col>
    </v-row>
</template>

<script>
import i18n from '@/assets/app/i18n';
import { TenantUsageDialog } from '@/assets/app/dialogs';

export default {
    props: {
        show: Boolean,
    },
    data: () => ({
        breadcrumbItems: [
            {
                title: '资源',
                href: '#/dashboard/hypervisor',
            },
            {
                title: i18n.global.t("tenantUsage"),
                disabled: true,
            },
        ],
        display: false,
        tenantUsageDialog: new TenantUsageDialog(),
    }),
    created() {
        this.tenantUsageDialog.refresh();
    },
    watch: {
        show(newVal) {
            this.display = newVal;
        },
        display(newVal) {
            this.display = newVal;
            this.$emit("update:show", this.display);
        },
    },
};
</script>