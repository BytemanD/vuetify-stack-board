<template>
    <v-row>
        <v-col>
          <v-tabs v-model="tabIndex" selected-class="bg-blue-grey-lighten-1" slider-color="blue-grey-lighten-1" density="compact">
            <v-tab><v-icon>mdi-alpha-v-box</v-icon> 卷 </v-tab>
            <v-tab><v-icon>mdi-alpha-s-box</v-icon> 快照 </v-tab>
            <v-tab><v-icon>mdi-alpha-b-box</v-icon> 备份 </v-tab>
            <v-tab><v-icon>mdi-alpha-t-box</v-icon> 类型 </v-tab>
            <v-tab><v-icon>mdi-alpha-s-box</v-icon> 服务 </v-tab>
            <v-tab><v-icon>mdi-alpha-p-box</v-icon> 存储池 </v-tab>
          </v-tabs>
          <div class="bg-blue-grey-lighten-1" style="height: 2px;"></div>
          <v-window v-model="tabIndex" class="mt-4">
            <v-window-item><VolumePage/></v-window-item>
            <v-window-item><SnapshotPage /> </v-window-item>
            <v-window-item> <BackupPage /> </v-window-item>
            <v-window-item> <TypePage /> </v-window-item>
            <v-window-item> <ServicePage /> </v-window-item>
            <v-window-item> <PoolPage /> </v-window-item>
            </v-window>
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
