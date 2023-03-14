<template>
    <v-row>
        <v-col>
            <v-tabs v-model="tabIndex" centered color="purple">
              <v-tab><v-icon>mdi-alpha-v-box</v-icon> 卷 </v-tab>
              <v-tab><v-icon>mdi-alpha-s-box</v-icon> 快照 </v-tab>
              <v-tab><v-icon>mdi-alpha-b-box</v-icon> 备份 </v-tab>
              <v-tab><v-icon>mdi-alpha-t-box</v-icon> 类型 </v-tab>
              <v-tab><v-icon>mdi-alpha-s-box</v-icon> 服务 </v-tab>
                <v-tabs-items v-model="tabIndex">
                    <v-tab-item> <VolumePage /> </v-tab-item>
                    <v-tab-item> <SnapshotPage /> </v-tab-item>
                    <v-tab-item> <BackupPage /> </v-tab-item>
                    <v-tab-item> <TypePage /> </v-tab-item>
                    <v-tab-item> <ServicePage /> </v-tab-item>
                </v-tabs-items>
            </v-tabs>
        </v-col>
  </v-row>
</template>

<script>
import VolumePage from './storage/VolumePage.vue';
import SnapshotPage from './storage/SnapshotPage';
import BackupPage from './storage/BackupPage';
import TypePage from './storage/TypePage';
import ServicePage from './storage/ServicePage';

export default {
  components: {
    VolumePage, BackupPage, SnapshotPage, TypePage, ServicePage
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
