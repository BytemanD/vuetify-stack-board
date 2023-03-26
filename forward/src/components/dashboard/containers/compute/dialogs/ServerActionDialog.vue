<template>
    <v-dialog v-model="display" width="1000" scrollable>
        <v-card>
            <v-card-title primary-title class="headline primary lighten-2">
                虚拟机操作记录({{ dialog.actions.length }})
            </v-card-title>
            <v-card-text class="mp-0">
                <v-timeline dense>
                    <v-timeline-item small right v-for="item in dialog.actions"
                        :color="dialog.isActionError(item) == true ? 'error' : 'success'" v-bind:key="item.request_id">
                        <v-row>
                            <v-col class="text-left" cols="3">
                                {{ dialog.formatTime(item.start_time) }}</v-col>
                            <v-col cols="3"><strong>{{ item.action }}</strong></v-col>
                            <v-col>
                                <a @click="openServerActionEventsDialog(item.request_id)">{{
                                    item.request_id }}</a>
                            </v-col>
                        </v-row>
                    </v-timeline-item>
                </v-timeline>
            </v-card-text>
        </v-card>
        <ServerActionEventsDialog :show.sync="showServerActionEventsDialog" :server="server" :requestId="actionRequestId"/>
    </v-dialog>
</template>
<script>
import i18n from '@/assets/app/i18n';
import { Utils } from '@/assets/app/lib';
import { ServerActionsDialog } from '@/assets/app/dialogs';

import ServerActionEventsDialog from './ServerActionEventsDialog.vue';

export default {
    components:{
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