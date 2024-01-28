<template>
    <v-dialog v-model="display" width="500">
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" color="warning" class="ml-1" @click="showServerMigrateDialog = !showServerMigrateDialog"
                :disabled="servers.length == 0">迁移</v-btn>
        </template>
        <v-card>
            <v-card-title class="headline warning" primary-title>迁移</v-card-title>
            <v-card-text>
                <v-switch persistent-hint v-model="dialog.smart" color="info" label="智能模式" hint=智能模式根据虚拟机状态选择冷迁移还是热迁移></v-switch>
                <v-switch hide-details v-model="dialog.liveMigrate" color="info"  label="热迁移" :disabled="dialog.smart"></v-switch>
                <v-select clearable :items="dialog.nodes" label="目标节点" v-model="dialog.host"
                    @click="dialog.refreshHosts()"></v-select>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="warning" @click="commit()">迁移</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
import i18n from '@/assets/app/i18n';
import { Utils } from '@/assets/app/lib';
import { MigrateDialog } from '@/assets/app/dialogs';

export default {
    props: {
        servers: Array,
        serverTable: Object,
    },
    data: () => ({
        i18n: i18n,
        Utils: Utils,
        display: false,
        dialog: new MigrateDialog(),
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
        display(newVal) {
            if (this.display) {
                this.dialog.init(this.servers, this.serverTable);
            }
            this.display = newVal;
            this.$emit("update:show", this.display);
        }
    },
};
</script>