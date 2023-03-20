<template>
    <v-dialog v-model="display" width="1000" scrollable>
        <v-card>
            <v-card-title class="headline primary" primary-title>
                <v-row>
                    <v-col cols="4">
                        <v-text-field dense outlined hide-details label="行数" v-model="dialog.length"></v-text-field>
                    </v-col>
                    <v-col>
                        <v-btn small class='mr-1' color="purple white--text" @click="dialog.refresh()" :disabled="dialog.refreshing">
                            <v-icon v-if="dialog.refreshing" class="mdi-spin">mdi-rotate-right</v-icon>
                            <v-icon v-else>mdi-refresh</v-icon>
                            刷新...
                        </v-btn>
                        <v-btn small class='mr-1' color="purple white--text" @click="dialog.more()" :disabled="dialog.refreshing">更多...</v-btn>
                        <v-btn small class='mr-1' color="purple white--text" @click="dialog.all()" :disabled="dialog.refreshing">全部
                        </v-btn>
                    </v-col>
                    <v-col cols="2">
                        <v-switch dense hide-details class="my-auto" color="purple" @click="dialog.toggleAutoRefresh()" label="自动刷新"></v-switch>
                    </v-col>
                </v-row>
            </v-card-title>
            <v-card-text class="pa-0">
                <pre class="white--text grey darken-3 pa-4">{{ dialog.content }}</pre>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>
<script>
import i18n from '@/assets/app/i18n';
import { Utils } from '@/assets/app/lib';
import { ServerConsoleLogDialog } from '@/assets/app/dialogs';

export default {
    props: {
        show: Boolean,
        server: Object,
    },
    data: () => ({
        i18n: i18n,
        Utils: Utils,
        display: false,
        dialog: new ServerConsoleLogDialog(),
    }),
    methods: {

    },
    created() {

    },
    watch: {
        show(newVal) {
            this.display = newVal;
            this.dialog.show = this.display;
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