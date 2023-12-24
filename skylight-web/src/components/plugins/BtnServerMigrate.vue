<template>
    <v-dialog v-model="dialog.show" width="500">
        <template v-slot:activator="{ props }">
            <v-btn variant="text" v-bind="props" color="warning" class="ml-1" :disabled="servers.length == 0">迁移</v-btn>
        </template>
        <v-card>
            <v-card-title class="headline warning" primary-title>迁移</v-card-title>
            <v-card-text>
                <v-radio-group color="info" mandatory label='选择迁移模式' v-model="dialog.migrateMode">
                    <v-radio label="自动(根据虚拟机状态选择冷迁移还是热迁移)" value="auto"></v-radio>
                    <v-radio label="热迁移" value="live"></v-radio>
                    <v-radio label="冷迁移" value="cold"></v-radio>
                </v-radio-group>
                <v-select clearable :items="dialog.nodes" label="目标节点" class="ml-4" v-model="dialog.host"
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

import { reactive, defineProps, defineEmits, watch } from 'vue';
import API from '@/assets/app/api';
import notify from '@/assets/app/notify.js';

import { MigrateDialog } from '@/assets/app/dialogs';
import { ServerTaskWaiter } from '@/assets/app/tables';

const progs = defineProps({
    variant: { type: String, default: 'text' },
    servers: { type: Array, default: [], required: true, },
})
const emits = defineEmits(['updateServer'])

var dialog = reactive(new MigrateDialog())

watch(() => progs.servers, (newValue, oldValue) => {
    dialog.servers = newValue;
    dialog.nodes = [];
})

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
    try {
        await dialog.commit();
    }
    catch (error) {
        notify.warning(error);
        return
    }
    dialog.show = false;
    for (let i in progs.servers) {
        let server = await getServer(getServerId(progs.servers[i]))
        let waiter = new ServerTaskWaiter(server, onUpdatedServer)
        await waiter.waitMigrated()
    }
}

</script>