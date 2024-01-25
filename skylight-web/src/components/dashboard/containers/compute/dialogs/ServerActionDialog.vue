<template>
    <v-dialog v-model="display" width="900" scrollable>
        <v-card>
            <v-card-title>虚拟机操作记录</v-card-title>
            <v-card-subtitle>{{ dialog.actions.length }}条记录</v-card-subtitle>
            <v-card-text class="pl-0">
                <v-timeline side="end" class="ml-0 pl-0">
                    <v-timeline-item fill-dot size="x-small" v-for="item in dialog.actions"
                        :dot-color="dialog.isActionError(item) ? 'red' : 'success'"
                        v-bind:key="item.action + '-' + item.request_id">
                        <template v-slot:opposite>{{ item.start_time }}</template>
                        <strong>{{ item.action }}</strong>
                        <v-chip density="compact" class="ml-4" @click="openServerActionEventsDialog(item.request_id)">
                            {{ item.request_id }}</v-chip>
                    </v-timeline-item>
                </v-timeline>
            </v-card-text>
        </v-card>
        <ServerActionEventsDialog :show="showServerActionEventsDialog"
            @update:show="(e) => showServerActionEventsDialog = e" :server="server" :requestId="actionRequestId" />
    </v-dialog>
</template>
<script>
import i18n from '@/assets/app/i18n';
import { Utils } from '@/assets/app/lib';
import { ServerActionsDialog } from '@/assets/app/dialogs';

import ServerActionEventsDialog from './ServerActionEventsDialog.vue';

export default {
    components: {
        ServerActionEventsDialog
    },
    props: {
        show: Boolean,
        server: Object,
    },
    data: () => ({
        i18n: i18n,
        Utils: Utils,
        display: false,
        dialog: new ServerActionsDialog(),
        showServerActionEventsDialog: false,
        actionRequestId: null
    }),
    methods: {
        openServerActionEventsDialog(requestId) {
            this.actionRequestId = requestId;
            this.showServerActionEventsDialog = !this.showServerActionEventsDialog;
        }
    },
    created() {

    },
    watch: {
        show(newVal) {
            this.display = newVal;
            if (this.display) {
                this.dialog.init(this.server);
            }
        },
        display(newVal) {
            this.display = newVal;
            this.$emit("update:show", this.display);
        }
    },
};
</script>