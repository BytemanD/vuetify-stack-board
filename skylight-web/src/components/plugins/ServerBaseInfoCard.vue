<template>
    <v-card density="compact">
        <v-card-text>
            <v-row>
                <v-col cols="10" md="6" lg="5">
                    <table density="compact" class="text-left">
                        <tr>
                            <td style="min-width: 80px">名称</td>
                            <th>
                                {{ server.name }}
                                <btn-server-rename variant="tonal" v-if="server.name" :server="server"
                                    @update-server="updateServer" />
                            </th>
                        </tr>
                        <tr>
                            <td>创建时间</td>
                            <th>{{ Utils.parseUTCToLocal(server.created) }}</th>
                        </tr>
                    </table>
                </v-col>
                <v-col cols="6" md="2" lg="4">
                    <table density="compact" class="text-left">
                        <tr>
                            <td style="min-width: 50px">状态</td>
                            <td>
                                <v-chip density="compact" v-if="server.status == 'ACTIVE'" color="success">{{
                                    server.status
                                    }}</v-chip>
                                <v-chip density="compact" v-else-if="server.status == 'SHUTOFF'" color="warning">
                                    {{ server.status }}</v-chip>
                                <v-chip density="compact" v-else-if="server.status == 'ERROR'" color="red">{{
                                    server.status
                                    }}</v-chip>
                                <v-chip density="compact" color="warning" v-else>{{ server.status }}</v-chip>
                            </td>
                        </tr>
                        <tr>
                            <td style="min-width: 50px">电源</td>
                            <td>
                                <v-icon v-if="server['OS-EXT-STS:power_state'] == 1" color="success">mdi-power</v-icon>
                                <v-icon v-else-if="server['OS-EXT-STS:power_state'] == 3"
                                    color="warning">mdi-pause</v-icon>
                                <v-icon v-else-if="server['OS-EXT-STS:power_state'] == 4" color="red">mdi-power</v-icon>
                                <span v-else>UNKOWN</span>
                            </td>
                        </tr>
                    </table>
                </v-col>
                <v-col cols="6" md="2" lg="3">
                    <template v-if="server['OS-EXT-STS:task_state']">
                        <v-alert type="warning" variant="text" density="compact">
                            {{ $t(server['OS-EXT-STS:task_state']) }}
                            <template v-slot:prepend>
                                <v-icon class="mdi-spin" size="small">mdi-loading</v-icon>
                            </template>
                        </v-alert>
                    </template>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script setup>

import { Utils } from '@/assets/app/lib.js';
import BtnServerRename from '@/components/plugins/BtnServerRename.vue';

const progs = defineProps({
    server: { type: Object, required: true, },
})
const emits = defineEmits(['updateServer'])

function updateServer(server) {
    for (var key in server) {
        if (progs.server[key] == server[key]) {
            continue
        }
        progs.server[key] = server[key]
    }
    emits('updateServer', progs.server)
}


</script>