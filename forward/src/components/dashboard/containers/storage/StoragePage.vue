<template>
    <v-row>
        <v-col>
            <v-tabs v-model="tabIndex" centered color="purple">
              <v-tab><v-icon>mdi-alpha-v-box</v-icon> 卷 </v-tab>
              <v-tab><v-icon>mdi-alpha-s-box</v-icon> 快照 </v-tab>
              <v-tab><v-icon>mdi-alpha-b-box</v-icon> 备份 </v-tab>
              <v-tab><v-icon>mdi-alpha-t-box</v-icon> 类型 </v-tab>
              <v-tab><v-icon>mdi-alpha-s-box</v-icon> 服务 </v-tab>
              <v-tab><v-icon>mdi-alpha-p-box</v-icon> 存储池 </v-tab>
                <v-tabs-items v-model="tabIndex">
                    <v-tab-item> <VolumePage /> </v-tab-item>
                    <v-tab-item> <SnapshotPage /> </v-tab-item>
                    <v-tab-item> <BackupPage /> </v-tab-item>
                    <v-tab-item> <TypePage /> </v-tab-item>
                    <v-tab-item> <ServicePage /> </v-tab-item>
                    <v-tab-item> <PoolPage /> </v-tab-item>
                </v-tabs-items>
            </v-tabs>
        </v-col>
  </v-row>
</template>

<script>
import VolumePage from './VolumePage.vue';
import SnapshotPage from './SnapshotPage';
import BackupPage from './BackupPage';
import TypePage from './TypePage';
import ServicePage from './ServicePage';
import PoolPage from './PoolPage';

export default {
  components: {
    VolumePage, BackupPage, SnapshotPage, TypePage, ServicePage, PoolPage
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
