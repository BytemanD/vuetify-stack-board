<template>
    <v-row>
        <v-col cols="12">
            <v-tabs v-model="tabIndex" centered color="purple">
                <v-tab><v-icon>mdi-alpha-f-box</v-icon> 规格 </v-tab>
                <v-tab><v-icon>mdi-alpha-k-box</v-icon> 密钥对 </v-tab>
                <v-tab><v-icon>mdi-alpha-s-box</v-icon> 服务 </v-tab>
                <v-tab><v-icon>mdi-alpha-z-box</v-icon> AZ </v-tab>
                <v-tab><v-icon>mdi-alpha-a-box</v-icon> 聚合 </v-tab>
                <v-tab><v-icon>mdi-alpha-m-box</v-icon> 迁移记录 </v-tab>
                <v-tabs-items v-model="tabIndex">
                    <v-tab-item> <FlavorPage /> </v-tab-item>
                    <v-tab-item> <KeypairPage /> </v-tab-item>
                    <v-tab-item> <ServicePage /> </v-tab-item>
                    <v-tab-item> <AZPage /> </v-tab-item>
                    <v-tab-item> <AggPage /> </v-tab-item>
                    <v-tab-item> <MigrationPage /> </v-tab-item>
                </v-tabs-items>
            </v-tabs>
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

export default {
  components: {
    FlavorPage, KeypairPage, AZPage, ServicePage, AggPage, MigrationPage,
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
