<template>
    <v-dialog v-model="display" width="500">
        <v-card>
            <v-card-title class="headline primary lighten-2" primary-title>重置状态</v-card-title>
            <v-card-text>
                <v-radio-group v-model="dialog.active" hide-details>
                    <v-radio label="active" :value="true"></v-radio>
                    <v-radio label="error" :value="false"></v-radio>
                </v-radio-group>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="commit()">重置</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
import i18n from '@/assets/app/i18n';
import { Utils } from '@/assets/app/lib';
import { ServerResetStateDialog } from '@/assets/app/dialogs';

export default {
    props: {
        show: Boolean,
        servers: Array,
    },
    data: () => ({
        i18n: i18n,
        Utils: Utils,
        display: false,
        dialog: new ServerResetStateDialog(),
    }),
    methods: {
        commit: async function () {
            await this.dialog.commit();
            this.display = false;
            this.$emit('completed');
        }
    },
    created() {
    },
    watch: {
        show(newVal) {
            this.display = newVal;
            if (this.display) {
                this.dialog.init(this.servers);
            }
        },
        display(newVal) {
            this.display = newVal;
            this.$emit("update:show", this.display);
        }
    },
};
</script>