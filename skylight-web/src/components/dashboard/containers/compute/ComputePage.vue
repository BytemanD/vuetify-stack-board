<template>
    <tab-windows :tabs="tabs">
      <template v-slot:window-items>
        <v-window-item><FlavorPage /></v-window-item>
        <v-window-item><KeypairPage /></v-window-item>
        <v-window-item><ServicePage /></v-window-item>
        <v-window-item><AZPage /></v-window-item>
        <v-window-item><AggPage /></v-window-item>
        <v-window-item><MigrationPage /></v-window-item>
        <v-window-item><ServerGroupPage /></v-window-item>
      </template>
    </tab-windows>
</template>

<script setup>
import { ref } from 'vue';

import TabWindows from '@/components/plugins/TabWindows.vue';
import FlavorPage from './FlavorPage.vue';
import KeypairPage from './KeypairPage.vue';
import ServicePage from './ServicePage.vue';
import AZPage from './AZPage.vue';
import AggPage from './AggPage.vue';
import MigrationPage from './MigrationPage.vue';
import ServerGroupPage from './ServerGroupPage.vue';

var tabs = ref([
  {text: '规格', icon: 'mdi-alpha-f-box'},
  {text: '密钥对', icon: 'mdi-alpha-k-box'},
  {text: '服务', icon: 'mdi-alpha-s-box'},
  {text: 'AZ', icon: 'mdi-alpha-z-box'},
  {text: '聚合', icon: 'mdi-alpha-a-box'},
  {text: '迁移记录', icon: 'mdi-alpha-m-box'},
  {text: '主机组', icon: 'mdi-alpha-g-box'},
])

</script>
