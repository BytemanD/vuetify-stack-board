<template>
    <v-dialog v-model="display" width="960" scrollable>
        <v-card>
            <v-card-title >{{ dialog.instanceAction.action }} 事件
            </v-card-title>
            <v-card-text class="pa-2">
                <v-expansion-panels>
                    <v-expansion-panel v-for="(item, i) in dialog.instanceAction.events"
                        :class="dialog.isEventError(item) ? 'error lighten-1' : 'success lighten-1'" v-bind:key="i">
                        <v-expansion-panel-title>
                            {{ dialog.formatTime(item.start_time) }} - {{ dialog.formatTime(item.finish_time) }}
                            <strong class="mx-4">{{ item.event }}</strong> {{ item.result }}
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
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
import { ServerActionEventsDialog } from '@/assets/app/dialogs';

export default {
    props: {
        show: Boolean,
        server: Object,
        requestId: String,
    },
    data: () => ({
        i18n: i18n,
        Utils: Utils,
        display: false,
        dialog: new ServerActionEventsDialog(),
    }),
    methods: {

    },
    created() {
    },
    watch: {
        show(newVal) {
            this.display = newVal;
            if (this.display) {
                this.dialog.init(this.server, this.requestId);
            }
        },
        display(newVal) {
            this.display = newVal;
            this.$emit("update:show", this.display);
        }
    },
};
</script>