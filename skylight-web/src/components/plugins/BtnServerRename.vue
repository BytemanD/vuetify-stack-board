<template>
    <v-dialog v-model="display" width="500">
        <template v-slot:activator="{ props }">
            <v-btn :variant="variant" :size="size" v-bind="props" color="purple" density="compact"
                class="ml-4 pa-0">重命名</v-btn>
        </template>
        <v-card>
            <v-card-title>重命名</v-card-title>
            <v-card-subtitle>当前实例名: {{ server.id || server.name }}</v-card-subtitle>
            <v-card-text>
                <v-text-field density="compact" hide-details placeholder="请输入新实例名" v-model="newName">
                    <template v-slot:prepend>新实例名</template>
                </v-text-field>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="warning" block @click="rename()" :disabled="newName == ''">修改</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>

import { ref, defineProps, defineEmits } from 'vue';
import API from '@/assets/app/api';
import notify from '@/assets/app/notify';

const emits = defineEmits(['updateServer'])
const progs = defineProps({
    server: { type: Object, required: true, },
    variant: { type: String, default: 'text' },
    size: { type: String, default: 'default' },
})

var display = ref(false)
var newName = ref('')

async function rename() {
    await API.server.update(progs.server.id, { name: newName.value });
    notify.success('实例名修改成功');
    let newServer = await API.server.show(progs.server.id)
    emits('updateServer', newServer)
    display.value = false;
}

</script>