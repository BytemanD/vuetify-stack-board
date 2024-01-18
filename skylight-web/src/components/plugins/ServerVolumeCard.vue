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
                <tr>
                    <td>大小</td>
                    <td>{{ vol.size }}</td>
                </tr>
            </v-table>
        </v-card-text>
    </v-card>
</template>

<script setup>
import { ref, defineProps } from 'vue';

import API from '@/assets/app/api';

var vol = ref({});

const progs = defineProps({
    serverId: { type: String, required: true, },
    volume: { type: Object, default: {}, required: true, },
    rootDeviceName: { type: String, default: '/dev/vda' },
})

async function showVolume(){
    vol.value = await API.volume.show(progs.volume.volumeId)
}
showVolume()

</script>