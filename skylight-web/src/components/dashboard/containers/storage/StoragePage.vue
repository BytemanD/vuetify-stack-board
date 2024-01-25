<template>
    <tab-windows :tabs="tabs">
      <template v-slot:window-items>
        <v-window-item><VolumePage /></v-window-item>
        <v-window-item><SnapshotPage /></v-window-item>
        <v-window-item><BackupPage /></v-window-item>
        <v-window-item><TypePage /></v-window-item>
        <v-window-item><ServicePage /></v-window-item>
        <v-window-item><PoolPage /></v-window-item>
      </template>
    </tab-windows>
</template>

<script>
import VolumePage from './VolumePage.vue';
import SnapshotPage from './SnapshotPage';
import BackupPage from './BackupPage';
import TypePage from './TypePage';
import ServicePage from './ServicePage';
import PoolPage from './PoolPage';
import TabWindows from '@/components/plugins/TabWindows.vue';

export default {
  components: {
    VolumePage, BackupPage, SnapshotPage, TypePage, ServicePage, PoolPage,
    TabWindows,
  },

  data: () => ({
    tabs: [
      { text: '卷', icon: 'mdi-alpha-v-box' },
      { text: '快照', icon: 'mdi-alpha-s-box' },
      { text: '备份', icon: 'mdi-alpha-b-box' },
      { text: '类型', icon: 'mdi-alpha-t-box' },
      { text: '服务', icon: 'mdi-alpha-s-box' },
      { text: '存储池', icon: 'mdi-alpha-p-box' },
    ]
  }),
};
</script>
