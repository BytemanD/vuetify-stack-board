<template>
    <v-dialog scrollable v-model="display" width="800">
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" color="primary" icon="mdi-plus" variant="text" class="mr-1"></v-btn>
        </template>
        <v-card title="添加网卡">
            <template v-slot:append>
                <btn-router-link router-to='/dashboard/networking' text="网络资源" />
                <v-btn variant="outlined" color="warning" @click="attach()">挂载</v-btn>
            </template>
            <v-card-text>
                <v-row>
                    <v-col cols="6">
                        <h4>端口</h4>
                        <v-select multiple chips outlined :items="ports" placeholder="选择端口" item-value="id"
                            :item-props="(item) => { return { title: item.id, subtitle: item.name } }"
                            v-model="selectedPorts">
                        </v-select>
                    </v-col>
                    <v-col cols="6">
                        <h4>网络</h4>
                        <v-select multiple chips outlined :items="networks" placeholder="选择网络" item-value="id"
                            :item-props="(item) => { return { title: item.id, subtitle: item.name } }"
                            v-model="selectedNetworks">
                        </v-select>
                    </v-col>
                </v-row>
                <br>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>
<script>
import API from '@/assets/app/api';

import BtnRouterLink from '@/components/plugins/BtnRouterLink.vue';

export default {
    props: {
        serverId: { type: String, required: true },
    },
    components: { BtnRouterLink },
    data: () => ({
        display: false,
        ports: [],
        networks: [],
        selectedPorts: [],
        selectedNetworks: [],
    }),
    methods: {
        attachSelectedPorts: async function () {
            let attachPorts = this.selectedPorts;
            for (let i in attachPorts) {
                let item = attachPorts[i];
                this.$emit('attaching-port', item)
                await API.server.interfaceAttach(this.serverId, { port_id: item })
                this.$emit('attached-port', item)
            }
        },
        attachSelectedNets: async function () {
            let attachNets = this.selectedNetworks;
            for (let i in attachNets) {
                let item = attachNets[i];
                this.$emit('attaching-net', item)
                await API.server.interfaceAttach(this.serverId, { net_id: item })
                this.$emit('attached-net', item)
            }
        },
        refreshNetworks: async function () {
            this.networks = (await API.network.list()).networks;
        },
        refreshPorts: async function () {
            this.ports = (await API.port.list({ device_id: '+' })).ports
        },
        attach: async function () {
            this.display = false;
            await this.attachSelectedPorts()
            await this.attachSelectedNets()
        }
    },
    watch: {
        display(newVal) {
            this.display = newVal;
            if (this.display) {
                this.selectedPorts = [];
                this.selectedNetworks = [];
                this.refreshNetworks()
                this.refreshPorts()
            }
        },
    },
};
</script>