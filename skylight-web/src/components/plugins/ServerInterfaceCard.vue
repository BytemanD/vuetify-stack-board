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
                <tr>
                    <td>VNIC 类型</td>
                    <td>{{ port['binding:vnic_type'] }}</td>
                </tr>
                <tr>
                    <td>VIF 类型</td>
                    <td>{{ port['binding:vif_type'] }}</td>
                </tr>
            </v-table>
        </v-card-text>
    </v-card>
</template>

<script setup>
import { ref, defineProps } from 'vue';
import API from '@/assets/app/api';

var port = ref({});

const progs = defineProps({
    serverId: { type: String, required: true, },
    vif: { type: Object, default: {}, required: true }
})

async function showPort() {
    API.port.show()
    port.value = (await API.port.show(progs.vif.port_id)).port
}
showPort()

</script>