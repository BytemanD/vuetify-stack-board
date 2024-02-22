<template>
    <v-dialog v-model="dialog.show" width="600" scrollable>
        <template v-slot:activator="{ props }">
            <v-btn variant="text" v-bind="props" color="warning" class="ml-1" :disabled="servers.length == 0">疏散</v-btn>
        </template>
        <v-card>
            <v-card-title class="headline warning" primary-title>疏散</v-card-title>
            <v-card-text>
                <v-switch density="compact" label="强制" v-model="force" color="warning"></v-switch>
                <v-select density="compact" :loading="loadingNodes" clearable :items="dialog.nodes" placeholder="请选择目标节点"
                    v-model="dialog.host" @click="refreshHosts()">
                    <template v-slot:prepend>目标节点</template>
                </v-select>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="warning" @click="evacuate()">执行</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>

import { reactive, defineProps, defineEmits, watch, ref } from 'vue';
import API from '@/assets/app/api';
import notify from '@/assets/app/notify.js';

import { EvacuateDialog } from '@/assets/app/dialogs';
import { ServerTaskWaiter } from '@/assets/app/tables';

const progs = defineProps({
    variant: { type: String, default: 'text' },
    servers: { type: Array, default: [], required: true, },
})
const emits = defineEmits(['updateServer'])

var dialog = reactive(new EvacuateDialog())
var force = ref(false)
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
async function evacuate() {
    // dialog.servers = [];
    // TODO: move commit() code to this page
    let disabledReason = 'disable by skylight (强制疏散)'
    let disabledService = []
    let servers = []
    if (force.value) {
        for (let s of dialog.servers) {
            let server = await getServer(s)
            servers.push(server);
            if (disabledService.indexOf(server['OS-EXT-SRV-ATTR:host']) >= 0) {
                continue
            }
            let service =  await API.computeService.find(server['OS-EXT-SRV-ATTR:host'], 'nova-compute')
            if (!service) {
                throw Error(`未找到 ${server["OS-EXT-SRV-ATTR:host"]} 的计算服务`)
            }
            if (service.status != 'disabled') {
                notify.info(`disable ${server["OS-EXT-SRV-ATTR:host"]}`)
                await API.computeService.disable(service.id, disabledReason)
            }
            if (service.state != 'down') {
                notify.info(`force down ${server["OS-EXT-SRV-ATTR:host"]}`)
                await API.computeService.forceDown(service.id, true)
            }
            disabledService.push(server["OS-EXT-SRV-ATTR:host"])
        }
    }
    dialog.servers = servers;
    try {
        await dialog.commit();
    } catch (error) {
        console.error(error)
        notify.warning(error);
        return
    }
    dialog.show = false;
    for (let s of servers) {
        let waiter = new ServerTaskWaiter(s, onUpdatedServer)
        waiter.waitEvacuated()
    }
}

async function refreshHosts() {
    loadingNodes.value = true
    await dialog.refreshHosts()
    loadingNodes.value = false
}

</script>