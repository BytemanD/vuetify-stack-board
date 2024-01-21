<template>
    <tab-windows :tabs="tabs">
        <template v-slot:window-items>
          <v-window-item> <NetworkPage /> </v-window-item>
          <v-window-item> <RouterPage /> </v-window-item>
          <v-window-item> <PortPage /> </v-window-item>
          <v-window-item> <SGPage /> </v-window-item>
          <v-window-item> <QosPolicyPage /> </v-window-item>
        </template>
    </tab-windows>
</template>

<script setup>
import { ref } from 'vue';

import TabWindows from '@/components/plugins/TabWindows.vue';
import NetworkPage from './NetworkPage.vue';
import RouterPage from './RouterPage.vue';
import PortPage from './PortPage.vue';
import SGPage from './SGPage.vue';
import QosPolicyPage from './QosPolicyPage.vue';

var tabs = ref([
  {text: '网络', icon: 'mdi-network'},
  {text: '路由', icon: 'mdi-router'},
  {text: '端口', icon: 'mdi-ethernet'},
  {text: '安全组', icon: 'mdi-security'},
  {text: 'QoS策略', icon: 'mdi-speedometer'},
])

</script>
