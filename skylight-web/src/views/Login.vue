<template>
  <v-container class="text-center">
    <v-card width="500" class="mx-auto " elevation="10">
      <v-img height="80" src="@/assets/favicon.svg" class="mt-4" />
      <v-card-title>欢迎使用 Skylight</v-card-title>
      <v-card-text>
        <v-select density="compact" item-title="name" label="选择集群" item-value="id" class="rounded-0"
          v-model="auth.cluster" :items="clusters" @update:modelValue="changeCluster()"
          prepend-icon="mdi-map">
          <template v-slot:append>
            <v-btn density="compact" color="info" variant="text" icon="mdi-refresh" @click="refreshClusters()"></v-btn>
            <new-cluster @completed="refreshClusters()" />
          </template>
        </v-select>

        <v-select density="compact" class="rounded-0" label="选择地区" v-model="auth.region" :items="regions"
          :disabled="refreshingRegion" prepend-icon="mdi-map-marker">
        </v-select>
        <v-text-field density="compact" placeholder="请输入用户名" prepend-icon="mdi-account" v-model="auth.username">
        </v-text-field>
        <v-text-field density="compact" placeholder="请输入密码" v-model="auth.password" prepend-icon="mdi-lock"
          :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" :type="showPassword ? 'text' : 'password'"
          @click:append-inner="showPassword = !showPassword">
        </v-text-field>
      </v-card-text>

      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="info" rounded variant="flat" style="width: 40%;" text="登录" @click="login()">登录</v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
    <v-notifications location="bottom right" :timeout="3000" />
  </v-container>
</template>

<script setup>
import { ref, getCurrentInstance } from 'vue';

import API from '@/assets/app/api';
import notify from '@/assets/app/notify';
import NewCluster from '@/components/welcome/NewCluster.vue';

var showPassword = ref(false);
var refreshingRegion = ref(false);

const auth = ref({ cluster: null, region: null, username: null, password: null, });
const { proxy } = getCurrentInstance()

const clusters = ref([])
const regions = ref([])

async function refreshClusters() {
  clusters.value = (await API.cluster.list()).clusters
  if (clusters.value.length > 0 && !auth.value.cluster) {
    auth.value.cluster = clusters.value[0].id
  }
  refreshRegions(true)
}
function changeCluster() {
  auth.value.region = null;
  regions.value = [];
  refreshRegions(true)
}

async function refreshRegions(force = false) {
  if (!force && regions.value.length > 0) {
    return
  }
  if (!auth.value.cluster) {
    return
  }
  refreshingRegion.value = true;
  regions.value = await API.cluster.regions(auth.value.cluster)
  refreshingRegion.value = false;
  if (regions.value.length > 0 && !auth.value.region) {
    auth.value.region = regions.value[0]
  }
}

async function login() {
  if (!auth.value.cluster) { notify.error('请选择集群'); return }
  if (!auth.value.region) { notify.error('请选择地区'); return }
  try {
    let resp = await API.system.login(auth.value.username, auth.value.password)
    notify.success('登录成功')
    localStorage.setItem('clusterId', auth.value.cluster);
    sessionStorage.setItem('region', auth.value.region);
    localStorage.setItem('X-Token', resp.headers.get('X-Token'));
    proxy.$router.push('/dashboard')
  } catch (e) {
    notify.error('登录失败')
  }
}

localStorage.removeItem('clusterId')
refreshClusters()

</script>
