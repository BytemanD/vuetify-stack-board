<template>
    <v-card variant="tonal" :title="'MAC地址:' + vif.mac_addr" density="compact">
        <template v-slot:append>
            <v-btn variant="text" color="warning" @click="detach()">卸载</v-btn>
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
import { ref, defineProps, defineEmits } from 'vue';
import API from '@/assets/app/api';
import { Utils } from '@/assets/app/lib.js';

var port = ref({});
const emits = defineEmits(['detaching', 'detached'])

const progs = defineProps({
    serverId: { type: String, required: true, },
    vif: { type: Object, default: {}, required: true }
})

async function showPort() {
    port.value = (await API.port.show(progs.vif.port_id)).port
}
async function detach() {
    console.log('1111', progs.vif)
    await API.server.interfaceDetach(progs.serverId, progs.vif.port_id);
    emits('detaching', progs.vif.port_id)
    while (true) {
        let detached = true;
        let interfaces = await API.server.interfaceList(progs.serverId);
        for (var i in interfaces) {
            if (interfaces[i].port_id == progs.vif.port_id) {
                detached = false
                break
            }
        }
        if (!detached) {
            Utils.sleep(5)
        } else {
            break
        }
    }
    emits('detached', progs.vif.port_id)
}
showPort()

</script>