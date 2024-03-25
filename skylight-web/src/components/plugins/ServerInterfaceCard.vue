<template>
    <v-card variant="tonal" :title="'MAC地址: ' + vif.mac_addr" density="compact">
        <template v-slot:append>
            <v-btn variant="tonal" color="red" size="small" @click="detach()" :loading="detaching">
                {{ $t("detach") }}</v-btn>
        </template>
        <v-card-subtitle>ID: {{ vif.port_id }}</v-card-subtitle>
        <v-card-text>
            <v-row>
                <v-col>
                    <v-table density="compact" class="text-left">
                        <tr>
                            <td>状态</td>
                            <td>{{ vif.port_state }}</td>
                        </tr>
                        <tr>
                            <td>IP地址</td>
                            <td>
                                <v-chip size="small" class="mr-1" label v-for="fixedIp in vif.fixed_ips"
                                    :key="fixedIp.ip_address">
                                    {{ fixedIp.ip_address }}
                                </v-chip>
                            </td>
                        </tr>
                    </v-table>
                </v-col>
                <v-col>
                    <v-table density="compact" class="text-left">
                        <tr>
                            <td>VNIC 类型</td>
                            <td>{{ port['binding:vnic_type'] }}</td>
                        </tr>
                        <tr>
                            <td>VIF 类型</td>
                            <td>{{ port['binding:vif_type'] }}</td>
                        </tr>
                    </v-table>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import API from '@/assets/app/api';
import { Utils } from '@/assets/app/lib.js';

var port = ref({}), detaching = ref(false);
const emits = defineEmits(['detaching', 'detached'])

const progs = defineProps({
    serverId: { type: String, required: true, },
    vif: { type: Object, default: {}, required: true }
})

async function showPort() {
    port.value = (await API.port.show(progs.vif.port_id)).port
}
async function detach() {
    await API.server.interfaceDetach(progs.serverId, progs.vif.port_id);
    detaching.value = true;
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
            await Utils.sleep(2)
        } else {
            break
        }
    }
    detaching.value = false;
    emits('detached', progs.vif.port_id)
}
showPort()

</script>