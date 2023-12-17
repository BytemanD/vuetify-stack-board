<template>
    <v-dialog v-model="dialog.show" width="500">
        <template v-slot:activator="{ props }">
            <v-btn variant="text" v-bind="props" color="warning" class="ml-1" :disabled="servers.length == 0">
                迁移
                <!-- {{ display }} -->
            </v-btn>
        </template>
        <v-card>
            <v-card-title class="headline warning" primary-title>迁移</v-card-title>
            <v-card-text>
                <v-switch density="compact" color="info" persistent-hint v-model="dialog.smart" label="智能模式"
                    hint=智能模式根据虚拟机状态选择冷迁移还是热迁移></v-switch>
                <v-switch hide-details v-model="dialog.liveMigrate" label="热迁移" :disabled="dialog.smart"></v-switch>
                <v-select clearable :items="dialog.nodes" label="目标节点" v-model="dialog.host"
                    @click="dialog.refreshHosts()"></v-select>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="warning" @click="migrate()">迁移</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>

import { ref, reactive, defineProps, defineEmits } from 'vue';
import API from '@/assets/app/api';

import { MigrateDialog } from '@/assets/app/dialogs';

import { ServerTaskWaiter } from '@/assets/app/tables';

const progs = defineProps({
    variant: { type: String, default: 'text' },
    servers: { type: Array, default: [], required: true, },
})

const emits = defineEmits(['updateServer'])

var display = ref(false);
var dialog = reactive(new MigrateDialog())

dialog.servers = progs.servers;

function getServerId(server) {
    return typeof server == 'object' ? server.id : server
}
async function getServer(server) {
    if (typeof server == 'object') {
        return server
    } else {
        let serverObject = await API.server.show(server)
        return serverObject
    }
}
function onUpdatedServer(server) {
    emits('updateServer', server)
}
async function migrate() {
    dialog.servers = [];
    for (let i in progs.servers) {
        let serverId = getServerId(progs.servers[i])
        dialog.servers.push(serverId)
    }
    // TODO: move commit() code to this page
    await dialog.commit();
    dialog.show = false;
    for (let i in progs.servers) {
        let server = await getServer(getServerId(progs.servers[i]))
        let waiter = new ServerTaskWaiter(server, onUpdatedServer)
        await waiter.waitMigrated()
    }
}

</script>