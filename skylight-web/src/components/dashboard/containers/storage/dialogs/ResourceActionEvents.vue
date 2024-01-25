<template>
    <v-dialog v-model="display" width="700" scrollable>
        <v-card>
            <v-card-title class="headline info" primary-title>事件</v-card-title>
            <v-card-subtitle>{{ dialog.resourceAction.action }}</v-card-subtitle>
            <v-card-text class="pa-2">
                <v-expansion-panels>
                    <v-expansion-panel v-for="(item, i) in dialog.resourceAction.events"
                        :class="dialog.isEventError(item) ? 'error lighten-1' : 'success lighten-1'" v-bind:key="i">
                        <v-expansion-panel-title>
                            {{ dialog.formatTime(item.start_time) }} - {{ dialog.formatTime(item.finish_time) }}
                            <strong class="mx-4"> {{ item.event }}</strong> {{ item.result }}
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                            <v-chip label color="info">节点: {{ item.host }}</v-chip>
                            <pre class="white--text grey darken-3">{{ item.traceback }}</pre>
                        </v-expansion-panel-text>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>
<script>
import i18n from '@/assets/app/i18n';
import { Utils } from '@/assets/app/lib';
import { ResourceActionEventsDialog } from '@/assets/app/dialogs';

export default {
    props: {
        show: Boolean,
        resource: Object,
        requestId: String,
    },
    data: () => ({
        i18n: i18n,
        Utils: Utils,
        display: false,
        dialog: new ResourceActionEventsDialog(),
    }),
    methods: {

    },
    created() {
    },
    watch: {
        show(newVal) {
            this.display = newVal;
            if (this.display) {
                console.log('xxxxx', this.resource, this.requestId)
                this.dialog.init(this.resource, this.requestId);
            }
        },
        display(newVal) {
            this.display = newVal;
            this.$emit("update:show", this.display);
        }
    },
};
</script>