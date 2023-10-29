<template>
    <v-dialog v-model="display" width="800" scrollable>
        <v-card>
            <v-card-title class="primary" primary-title>{{ $t('serverTopology') }}</v-card-title>
            <v-card-text>
                <div id="topology" style="height:400px;"></div>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>
<script>
import i18n from '@/assets/app/i18n';
import { ServerTopology } from '@/assets/app/dialogs';
import { Utils } from '@/assets/app/lib';

export default {
    props: {
        show: Boolean,
    },
    data: () => ({
        i18n: i18n,
        display: false,
        dialog: new ServerTopology(),
        windowsSize: {},
        Utils: Utils
    }),
    methods: {

    },
    watch: {
        show(newVal) {
            this.display = newVal;
        },
        display(newVal) {
            this.display = newVal;
            this.$emit("update:show", this.display);
            if (this.display) {
                this.dialog.init('topology');
            }
        }
    },
};
</script>