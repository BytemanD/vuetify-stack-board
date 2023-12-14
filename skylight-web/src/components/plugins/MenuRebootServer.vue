<template>
    <v-menu>
        <template v-slot:activator="{ props }">
            <v-btn color="primary" :variant="variant" v-bind="props" :disabled="servers.length == 0" class="pa-0">
                <v-icon>mdi-menu</v-icon>
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
    variant: {type: String, default: 'text'},
    servers: { type: Array, default: [], required: true, },
})

async function softReboot() {
    for (let i in progs.servers) {
        let serverId = progs.servers[i];
        API.server.reboot(serverId)
    }
    for (let i in progs.servers) {
        let serverId = progs.servers[i];
        let server = await API.server.show(serverId)
        emits('updateServer', server)

        let waiter = new ServerTaskWaiter(server)
        await waiter.waitStarted()
        emits('updateServer', server)
    }
}

async function hardReboot() {
    for (let i in progs.servers) {
        let serverId = progs.servers[i];
        API.server.hardReboot(serverId)
    }
    for (let i in progs.servers) {
        let serverId = progs.servers[i];
        let server = await API.server.show(serverId)
        emits('updateServer', server)

        let waiter = new ServerTaskWaiter(server)
        await waiter.waitStarted()
        emits('updateServer', server)
    }
}

</script>