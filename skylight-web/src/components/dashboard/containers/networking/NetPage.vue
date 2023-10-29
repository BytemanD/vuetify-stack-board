<template>
    <v-row>
        <v-col>
            <v-tabs v-model="tabIndex" align-tabs="center" selected-class="bg-purple" density="compact">
                <v-tab><v-icon>mdi-network</v-icon>网络</v-tab>
                <v-tab><v-icon>mdi-router</v-icon> 路由</v-tab>
                <v-tab><v-icon>mdi-ethernet</v-icon>端口</v-tab>
                <v-tab><v-icon>mdi-security</v-icon>安全组</v-tab>
                <v-tab><v-icon>mdi-speedometer</v-icon>QoS策略</v-tab>
                </v-tabs>
                <v-window v-model="tabIndex" class="mt-4">
                    <v-window-item> <NetworkPage /> </v-window-item>
                    <v-window-item> <RouterPage /> </v-window-item>
                    <v-window-item> <PortPage /> </v-window-item>
                    <v-window-item> <SGPage /> </v-window-item>
                    <v-window-item> <QosPolicyPage /> </v-window-item>
                </v-window>
        </v-col>
  </v-row>
</template>

<script setup>
import { ref } from 'vue';

import NetworkPage from './NetworkPage.vue';
import RouterPage from './RouterPage.vue';
import PortPage from './PortPage.vue';
import SGPage from './SGPage.vue';
import QosPolicyPage from './QosPolicyPage.vue';

var tabIndex = ref(0);

</script>
