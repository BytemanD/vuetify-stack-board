<template>
    <v-row>
        <v-col>
            <v-tabs v-model="tabIndex" centered color="purple">
                <v-tab><v-icon>mdi-network</v-icon>网络</v-tab>
                <v-tab><v-icon>mdi-router</v-icon> 路由</v-tab>
                <v-tab><v-icon>mdi-ethernet</v-icon>端口</v-tab>
                <v-tab><v-icon>mdi-security</v-icon>安全组</v-tab>
                <v-tab><v-icon>mdi-speedometer</v-icon>QoS策略</v-tab>
                <v-tabs-items v-model="tabIndex">
                    <v-tab-item> <NetworkPage /> </v-tab-item>
                    <v-tab-item> <RouterPage /> </v-tab-item>
                    <v-tab-item> <PortPage /> </v-tab-item>
                    <v-tab-item> <SGPage /> </v-tab-item>
                    <v-tab-item> <QosPolicyPage /> </v-tab-item>
                </v-tabs-items>
            </v-tabs>
        </v-col>
  </v-row>
</template>

<script>
import NetworkPage from './networking/NetworkPage.vue';
import RouterPage from './networking/RouterPage.vue';
import PortPage from './networking/PortPage.vue';
import SGPage from './networking/SGPage.vue';
import QosPolicyPage from './networking/QosPolicyPage.vue';

export default {
  components: {
    NetworkPage, RouterPage, PortPage, SGPage, QosPolicyPage
  },
  data: () => ({
    tabIndex: 0,
  }),
  methods: {
  },
  created() {
  }
};
</script>
