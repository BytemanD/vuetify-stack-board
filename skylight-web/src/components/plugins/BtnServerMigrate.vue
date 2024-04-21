<template>
    <v-dialog v-model="dialog.show" width="600" scrollable>
        <template v-slot:activator="{ props }">
            <v-btn variant="text" prepend-icon="mdi-menu" v-bind="props" color="warning" class="ml-1" :disabled="servers.length == 0">迁移</v-btn>
        </template>
        <v-card>
            <v-card-title class="headline warning" primary-title>迁移</v-card-title>
            <v-card-text>
                <v-radio-group density="compact" color="info" mandatory label='选择迁移模式' v-model="dialog.migrateMode">
                    <v-radio label="自动(根据虚拟机状态选择热迁移还是冷迁移)" value="auto" ></v-radio>
                    <v-radio label="热迁移" value="live"></v-radio>
                    <v-radio label="冷迁移" value="cold"></v-radio>
                </v-radio-group>
                <v-select density="compact" :loading="loadingNodes" clearable :items="dialog.nodes" placeholder="请选择目标节点"
                    v-model="dialog.host" @click="refreshHosts()">
                    <template v-slot:prepend>目标节点</template>
                </v-select>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="warning" @click="migrate()">执行</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>

import { reactive, defineProps, defineEmits, watch, ref } from 'vue';
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
var loadingNodes = ref(false)

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
    // dialog.servers = [];
    // TODO: move commit() code to this page
    try {
        await dialog.commit();
    } catch (error) {
        console.error(error)
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

async function refreshHosts() {
    loadingNodes.value = true
    await dialog.refreshHosts()
    loadingNodes.value = false
}

</script>