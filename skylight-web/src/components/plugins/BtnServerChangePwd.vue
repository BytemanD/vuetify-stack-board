<template>
    <v-dialog v-model="display" width="500">
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" :variant="variant" :size="size" color="warning">重置密码</v-btn>
        </template>
        <v-card>
            <v-card-title>重置密码</v-card-title>
            <v-card-text>
                <v-text-field density="compact" hide-details clearable label="新密码" placeholder="请输入密码" v-model="newPwd"
                    :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" :type="showPassword ? 'text' : 'password'"
                    @click:append="showPassword = !showPassword">
                </v-text-field>
                <br>
                <v-text-field hide-details density="compact" label="用户名" placeholder="请输入实例用户名(可选)"
                    v-model="username"></v-text-field>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="warning" block @click="resetPassword()" :disabled="newName == ''">重置</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>

import { ref, defineProps } from 'vue';
import API from '@/assets/app/api';
import notify from '@/assets/app/notify';

const progs = defineProps({
    server: { type: Object, required: true, },
    variant: { type: String, default: 'text' },
    size: { type: String, default: 'default' },
})

var display = ref(false)
var showPassword = ref(false)
var username = ref('')
var newPwd = ref('')

async function resetPassword() {
    try {
        await API.server.changePassword(progs.server.id, newPwd.value.trim(), username.value);
        notify.success('重置成功');
    } catch (e) {
        notify.error(`重置失败: ${e}`);
    }
    display.value = false;
}

</script>