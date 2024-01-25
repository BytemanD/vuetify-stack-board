<template>
    <v-dialog v-model="display" width="800" scrollable>
        <v-card>
            <v-card-title primary-title class="headline primary">资源操作记录({{ dialog.actions.length }})</v-card-title>
            <v-card-text class="ml-0">
                <v-timeline side="end" class="ml-0 pl-0">
                    <v-timeline-item fill-dot size="x-small" v-for="item in dialog.actions"
                        :dot-color="dialog.isActionError(item) == true ? 'error' : 'success'" v-bind:key="item.request_id">
                        <template v-slot:opposite>{{ dialog.formatTime(item.start_time) }}</template>
                        <div>
                            <strong>{{ item.action }}</strong>
                            <v-chip density="compact" class="ml-4" @click="openResourceActionEventsDialog(item.request_id)">
                                {{ item.request_id }}</v-chip>
                        </div>
                    </v-timeline-item>
                </v-timeline>
            </v-card-text>
        </v-card>
        <ResourceActionEvents :show="showResourcectionEventsDialog" @update:show="(e) => showResourcectionEventsDialog = e"
            :resource="resource" :request-id="actionRequestId" />
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
        openResourceActionEventsDialog(requestId) {
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