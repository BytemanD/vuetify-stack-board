<template>
    <v-card class="ma-1" variant="tonal" :title="'挂载路径:' + volume.device">
        <template v-slot:append>
            <v-btn variant="text" color="warning" v-if="volume.device != rootDeviceName">卸载</v-btn>
        </template>
        <v-card-subtitle>ID: {{ volume.volumeId }}</v-card-subtitle>
        <v-card-text>
            <v-table density="compact">
                <tr>
                    <td>挂载ID</td>
                    <td>{{ volume.id }}</td>
                </tr>
            </v-table>
        </v-card-text>
    </v-card>
</template>

<script setup>
import { defineProps } from 'vue';

const progs = defineProps({
    serverId: { type: String, required: true, },
    volume: { type: Object, default: {}, required: true, },
    rootDeviceName: { type: String, default: '/dev/vda' },
})

</script>