<template>
    <v-dialog v-model="dialog.show" width="900" scrollable>
        <template v-slot:activator="{ props }">
            <v-btn variant='tonal' color="warning" class="ml-1" density="compact" :disabled="servers.length == 0"
                v-bind="props">重装</v-btn>
        </template>
        <v-card title="重装系统">
            <template v-slot:append>
                <v-btn color="warning" @click="commit()">重装</v-btn>
            </template>
            <v-card-text>
                <v-text-field class="mb-1" density="compact" readonly hide-details clearable
                    :value="dialog.imageRef && (selectedImage.name || selectedImage.id)">
                    <template v-slot:prepend>镜像</template>
                </v-text-field>
                <image-table class="ml-4" @select-image="(image) => { selectImage(image) }"/>
                <v-text-field density="compact" label="密码" clearable placeholder="请输入密码" v-model="dialog.password"
                    :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" :type="showPassword ? 'text' : 'password'"
                    @click:append="showPassword = !showPassword">
                </v-text-field>
                <v-text-field label="描述" v-model="dialog.description"></v-text-field>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, reactive, defineProps, defineEmits, watch } from 'vue';
import API from '@/assets/app/api';
import notify from '@/assets/app/notify.js';

import { RebuildDialog } from '@/assets/app/dialogs';
import { ServerTaskWaiter } from '@/assets/app/tables';
import ImageTable from '@/components/plugins/tables/ImageTable.vue';

const progs = defineProps({
    variant: { type: String, default: 'text' },
    servers: { type: Array, default: [], required: true, },
})
const emits = defineEmits(['updateServer'])

var showPassword = ref(false)
var dialog = reactive(new RebuildDialog())
var selectedImage = reactive({})

function getServerId(server) {
    return typeof server == 'object' ? server.id : server
}
async function getServer(server) {
    if (typeof server == 'object') {
        return server
    } else {
        let serverObject = await API.server.show(server)
        return serverObject
    }
}
function onUpdatedServer(server) {
    emits('updateServer', server)
}
function selectImage(item) {
    selectedImage = item;
    dialog.imageRef = item.id;
}

async function commit() {
    dialog.show = false;
    for (let i in progs.servers) {
        let serverId = getServerId(progs.servers[i])
        let server = await getServer(getServerId(progs.servers[i]))
        let data = { imageRef: dialog.imageRef, description: dialog.description }
        if (dialog.password) {
            data.adminPass = dialog.password
        }
        await API.server.rebuild(serverId, data);
        notify.info(`实例 ${server.name} 重建中`)
        let waiter = new ServerTaskWaiter(server, onUpdatedServer)
        await waiter.waitRebuilded()
    }
}

</script>