<template>
  <v-container class="text-center">
    <v-img height="80" src="@/assets/favicon.svg" />
    <!-- <br> -->
    <h2 class="">Skylight</h2>
    <v-card width="400" class="mx-auto mt-4" elevation="10">
      <v-card-title color="info">登录</v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <v-text-field density="compact" placeholder="请输入用户名" prepend-icon="mdi-account" v-model="auth.username">
        </v-text-field>
        <v-text-field density="compact" placeholder="请输入密码" v-model="auth.password" prepend-icon="mdi-lock"
          :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" :type="showPassword ? 'text' : 'password'"
          @click:append-inner="showPassword = !showPassword">
        </v-text-field>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-btn color="primary" size="large" text="登录" block @click="login()">登录</v-btn>
      </v-card-actions>
    </v-card>
    <v-notifications location="top right" :timeout="3000" />
  </v-container>
</template>

<script setup>
import API from '@/assets/app/api';
import notify from '@/assets/app/notify';
import { ref, getCurrentInstance } from 'vue';

var showPassword = ref(false);
const auth = ref({ username: null, password: null });
const { proxy } = getCurrentInstance()

async function login() {
  try {
    let resp = await API.system.login(auth.value.username, auth.value.password)
    notify.success('登录成功')
    localStorage.setItem('X-Token', resp.headers.get('X-Token'));
    proxy.$router.push('/welcome')
  } catch (e) {
    notify.error('登录失败')
  }
}
</script>
