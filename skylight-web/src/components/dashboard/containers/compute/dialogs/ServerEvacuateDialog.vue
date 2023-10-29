<template>
    <v-dialog v-model="display" width="500">
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" color="warning" class="ml-1" @click="showServerEventDiallog = !showServerEventDiallog"
                :disabled="servers.length == 0">疏散</v-btn>
        </template>

        <v-card>
            <v-card-title class="headline warning" primary-title>虚拟机疏散</v-card-title>
            <v-card-text>
                <v-select clearable hide-details :items="dialog.nodes" label="目标节点" v-model="dialog.host"
                    @click="dialog.refreshHosts()"></v-select>
                <v-switch v-model="dialog.force" label="强制" :disabled="dialog.host == null"
                    messages="如果指定目标节点，可以选择是否强制疏散"></v-switch>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="warning" @click="commit()">疏散</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
import { MESSAGE } from '@/assets/app/lib';

import i18n from '@/assets/app/i18n';
import { Utils } from '@/assets/app/lib';
import { EvacuateDialog } from '@/assets/app/dialogs';

export default {
    props: {
        show: Boolean,
        servers: Array,
    },
    data: () => ({
        i18n: i18n,
        Utils: Utils,
        display: false,
        dialog: new EvacuateDialog(),
    }),
    methods: {
        commit: async function () {
            try {
                await this.dialog.commit();
                this.display = false;
                this.$emit('completed');
            } catch (error) {
                MESSAGE.warning(error.message)
            }
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