<template>
    <v-dialog scrollable v-model="display" width="600">
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" color="primary" icon="mdi-plus" variant="text" class="mr-1"></v-btn>
        </template>
        <v-card title="添加卷">
            <template v-slot:append>
                <btn-router-link router-to='/dashboard/storage' text="存储" />
                <v-btn variant="outlined" color="warning" @click="attach()">挂载</v-btn>
            </template>
            <v-card-text>
                <h4>可用卷</h4>
                <v-select multiple chips outlined :items="volumes" placeholder="选择卷" item-value="id"
                    :item-props="(item) => { return { title: item.id, subtitle: item.name } }"
                    v-model="selectedVolumes">
                </v-select>
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
    components: {BtnRouterLink},
    data: () => ({
        display: false,
        volumes: [],
        selectedVolumes: [],
    }),
    methods: {
        attachSelectedVolumes: async function () {
            let attachVolumes = this.selectedVolumes;
            for (let i in attachVolumes) {
                let volumeId = attachVolumes[i];
                this.$emit('attaching-volume', volumeId)
                await API.server.attachVolume(this.serverId, volumeId)
                await API.waitVolumeStatus(volumeId, ['in-use', 'error']);
                this.$emit('attached-volume', volumeId)
            }
        },
        refreshAvailableVolumes: async function () {
            this.volumes = (await API.volume.detail({ status: 'available' })).volumes;
        },
        attach: async function () {
            this.display = false;
            await this.attachSelectedVolumes()
        }
    },
    created() {

    },
    watch: {
        display(newVal) {
            this.display = newVal;
            this.selectedVolumes = [];
            if (this.display) {
                this.refreshAvailableVolumes()
            }
        },
    },
};
</script>