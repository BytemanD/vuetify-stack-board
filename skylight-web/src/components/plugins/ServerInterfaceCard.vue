<template>
    <v-card variant="tonal" :title="'MAC地址:' + vif.mac_addr">
        <template v-slot:append>
            <v-btn variant="text" color="warning">卸载</v-btn>
        </template>
        <v-card-subtitle>ID: {{ vif.port_id }}</v-card-subtitle>
        <v-card-text>
            <v-table density="compact" class="text-left">
                <tr>
                    <td>状态</td>
                    <td>{{ vif.port_state }}</td>
                </tr>
                <tr>
                    <td>IP地址</td>
                    <td>
                        <v-chip size="small" class="mr-1" label v-for="fixedIp in vif.fixed_ips" :key="fixedIp.ip_address">
                            {{ fixedIp.ip_address }}
                        </v-chip>
                    </td>
                </tr>
            </v-table>
        </v-card-text>
    </v-card>
</template>

<script setup>
import { defineProps } from 'vue';

const progs = defineProps({
    serverId: { type: String, required: true, },
    vif: { type: Object, default: {}, required: true }
})

</script>