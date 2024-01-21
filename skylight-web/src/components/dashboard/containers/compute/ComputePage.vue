<template>
  <v-row>
    <v-col cols="12">
      <v-tabs v-model="tabIndex" show-arrows selected-class="bg-blue-grey-lighten-1" slider-color="blue-grey-lighten-1" density="compact">
        <v-tab><v-icon>mdi-alpha-f-box</v-icon> 规格</v-tab>
        <v-tab><v-icon>mdi-alpha-k-box</v-icon> 密钥对 </v-tab>
        <v-tab><v-icon>mdi-alpha-s-box</v-icon> 服务 </v-tab>
        <v-tab><v-icon>mdi-alpha-z-box</v-icon> AZ </v-tab>
        <v-tab><v-icon>mdi-alpha-a-box</v-icon> 聚合 </v-tab>
        <v-tab><v-icon>mdi-alpha-m-box</v-icon> 迁移记录 </v-tab>
        <v-tab><v-icon>mdi-alpha-g-box</v-icon> 主机组 </v-tab>
      </v-tabs>
      <div class="bg-blue-grey-lighten-1" style="height: 2px;"></div>
      <v-window v-model="tabIndex" class="mt-4">
        <v-window-item><FlavorPage /></v-window-item>
        <v-window-item><KeypairPage /></v-window-item>
        <v-window-item><ServicePage /></v-window-item>
        <v-window-item><AZPage /></v-window-item>
        <v-window-item><AggPage /></v-window-item>
        <v-window-item><MigrationPage /></v-window-item>
        <v-window-item><ServerGroupPage /></v-window-item>
      </v-window>
    </v-col>
  </v-row>
</template>

<script>
import FlavorPage from './FlavorPage.vue';
import KeypairPage from './KeypairPage.vue';
import ServicePage from './ServicePage.vue';
import AZPage from './AZPage.vue';
import AggPage from './AggPage.vue';
import MigrationPage from './MigrationPage.vue';
import ServerGroupPage from './ServerGroupPage.vue';

export default {
  components: {
    FlavorPage, KeypairPage, AZPage, ServicePage, AggPage, MigrationPage,
    ServerGroupPage,
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
