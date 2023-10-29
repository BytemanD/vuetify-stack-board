<template>
    <v-dialog v-model="display" width="1000" scrollable>
        <v-card>
            <v-card-title primary-title class="headline primary">
                资源操作记录({{ dialog.actions.length }})
            </v-card-title>
            <v-card-text class="mp-0">
                <v-timeline density='compact'>
                    <v-timeline-item small right class="py-1" v-for="item in dialog.actions"
                        :color="dialog.isActionError(item) == true ? 'error' : 'success'" v-bind:key="item.request_id">
                        <v-row>
                            <v-col class="text-left" cols="3" >
                                {{ dialog.formatTime(item.start_time) }}</v-col>
                            <v-col cols="3"><strong>{{ item.action }}</strong></v-col>
                            <v-col>
                                <a @click="openResourceActionEventsDialog(item.request_id)">{{
                                    item.request_id }}</a>
                            </v-col>
                        </v-row>
                    </v-timeline-item>
                </v-timeline>
            </v-card-text>
        </v-card>
        <ResourceActionEvents :show.sync="showResourcectionEventsDialog" :resource="resource" :request-id="actionRequestId" />
    </v-dialog>
</template>
<script>
import i18n from '@/assets/app/i18n';
import { Utils } from '@/assets/app/lib';
import { ResourceActionsDialog } from '@/assets/app/dialogs';

import ResourceActionEvents from './ResourceActionEvents.vue';


export default {
    components: {
        ResourceActionEvents,
    },
    props: {
        show: Boolean,
        resource: Object,
    },
    data: () => ({
        i18n: i18n,
        Utils: Utils,
        display: false,
        dialog: new ResourceActionsDialog(),
        showResourcectionEventsDialog: false,
        actionRequestId: null
    }),
    methods: {
        openResourceActionEventsDialog(requestId){
            this.actionRequestId = requestId;
            this.showResourcectionEventsDialog = !this.showResourcectionEventsDialog;
        }
    },
    created() {

    },
    watch: {
        show(newVal) {
            this.display = newVal;
            if (this.display) {
                this.dialog.init(this.resource);
            }
        },
        display(newVal) {
            this.display = newVal;
            this.$emit("update:show", this.display);
        }
    },
};
</script>