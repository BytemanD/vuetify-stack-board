<template>
    <v-card class="ma-1">
        <v-card-title>挂载路径: {{ volume.device }}</v-card-title>
        <v-card-text>
            <v-table density="compact">
                <tr>
                    <td>挂载ID</td>
                    <td>{{ volume.id }}</td>
                </tr>
                <tr>
                    <td>卷ID</td>
                    <td>{{ volume.volumeId }}</td>
                </tr>
            </v-table>
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn v-if="volume.device != rootDeviceName" color="warning">卸载</v-btn>
        </v-card-actions>
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