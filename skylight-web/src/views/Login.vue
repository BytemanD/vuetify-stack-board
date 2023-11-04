<template>
  <v-container class="fill-height">
    <v-responsive class="align-center text-center fill-height">
      <v-img height="80" src="@/assets/favicon.svg" />
      <!-- <div class="text-body-2 font-weight-light">Welcome to</div> -->
      <h2 class="">Skylight</h2>
      <br>
      <v-card width="400" class="mx-auto" elevation="10">
        <v-card-title color="info">登录</v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-text-field density="compact" label="" placeholder="请输入用户名" prepend-icon="mdi-account"
            v-model="auth.username">
          </v-text-field>
          <v-text-field density="compact" label="" placeholder="请输入密码" v-model="auth.password" prepend-icon="mdi-lock"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" :type="showPassword ? 'text' : 'password'"
            @click:append="showPassword = !showPassword">
          </v-text-field>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-btn color="primary" text="登录" block @click="login()"></v-btn>
        </v-card-actions>
      </v-card>
      <br>
    </v-responsive>
    <v-notifications location="top right" :timeout="3000" />
  </v-container>
</template>

<script setup>
import API from '@/assets/app/api';
import notify from '@/assets/app/notify';
import { ref, getCurrentInstance} from 'vue';

var showPassword = ref(false);
const auth = ref({ username: null, password: null});
const {proxy} = getCurrentInstance()

async function login() {
  try {
    let resp = await API.system.login(auth.value.username, auth.value.password)
    notify.success('登录成功')
    localStorage.setItem('X-Token', resp.headers.get('X-Token'));
    proxy.$router.push('/welcome')
  } catch (e){
    notify.error('登录失败')
  }
}
</script>
