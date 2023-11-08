<template>
    <v-tooltip location="bottom" text="退出">
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" color="warning" icon="mdi-logout" v-on:click="logout()"></v-btn>
        </template>
    </v-tooltip>
</template>

<script setup>
import { getCurrentInstance} from 'vue';
import API from '@/assets/app/api';
import notify from '@/assets/app/notify';

const {proxy} = getCurrentInstance()

async function logout() {
    try {
        await API.system.logout()
    } catch (e) {
        notify.error("退出失败")
    }
    localStorage.removeItem('X-Token')
    proxy.$router.push('/login')
}

</script>