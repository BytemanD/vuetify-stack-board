<template>
    <v-menu>
        <template v-slot:activator="{ props }">
            <v-btn color="primary" :size="size" :variant="variant" class="ml-1" v-bind="props" :disabled="servers.length == 0">
                <template v-slot:append>
                    <v-icon>mdi-menu-down</v-icon>
                </template>
                {{ $t('reboot') }}
            </v-btn>
        </template>
        <v-list>
            <v-list-item @click="softReboot()">
                <v-list-item-title>软重启</v-list-item-title>
            </v-list-item>
            <v-list-item @click="hardReboot()">
                <v-list-item-title>硬重启</v-list-item-title>
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script setup>

import { defineProps, defineEmits } from 'vue';
import API from '@/assets/app/api';
import { ServerTaskWaiter } from '@/assets/app/tables';

const emits = defineEmits(['updateServer'])
const progs = defineProps({
    servers: { type: Array, default: [], required: true, },
    variant: {type: String, default: 'text'},
    size: { type: String, default: 'default'},
})

function getServerId(server){
    return typeof server == 'object' ? server.id : server
}
async function getServer(server){
    if (typeof server == 'object'){
        return server
    } else {
        let serverObject = await API.server.show(server)
        return serverObject
    }
}
function onUpdatedServer(server) {
    emits('updateServer', server)
}
async function softReboot() {
    for (let i in progs.servers) {
        API.server.reboot(getServerId(progs.servers[i]))
    }
    for (let i in progs.servers) {
        let server = await getServer(getServerId(progs.servers[i]))
        let waiter = new ServerTaskWaiter(server, onUpdatedServer)
        await waiter.waitStarted()
    }
}

async function hardReboot() {
    for (let s of progs.servers) {
        API.server.hardReboot(getServerId(s))
    }
    for (let s of progs.servers) {
        let server = await getServer(getServerId(s))
        let waiter = new ServerTaskWaiter(server, onUpdatedServer)
        await waiter.waitStarted()
    }
}

</script>