<template>
  <v-dialog v-model="display" width="500">
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" color="warning" :disabled="volumes.length==0">状态重置</v-btn>
    </template>

    <v-card>
      <v-card-title class="info" primary-title>重置卷状态</v-card-title>
      <v-card-text>
        <v-select clearable label="卷状态" :items="dialog.statusList" outlined density='compact' class="mt-5"
          v-model="dialog.status"></v-select>
        <v-select clearable label="挂载状态" :items="dialog.attachStatusList" outlined density='compact' class="mt-5"
          v-model="dialog.attachStatus"></v-select>
        <v-switch label="重置热迁移状态" class="my-auto" color="success" v-model="dialog.resetMigrateStatus" density='compact'></v-switch>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="warning" @click="commit()">重置</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import i18n from '@/assets/app/i18n';
import { Utils } from '@/assets/app/lib';

import { VolumeStateResetDialog } from '@/assets/app/dialogs';

export default {
  props: {
    show: Boolean,
    volumes: Array,
  },
  data: () => ({
    i18n: i18n,
    display: false,
    dialog: new VolumeStateResetDialog(),
    Utils: Utils
  }),
  methods: {
    commit: async function () {
      try {
        await this.dialog.commit(this.volumes);
        this.display = false;
        this.$emit('completed');
      } catch (error) {
        console.error(error)
      }
    }
  },
  created() {

  },
  watch: {
    show(newVal) {
      this.display = newVal;
    },
    display(newVal) {
      this.display = newVal;
      this.$emit("update:show", this.display);
    }
  },
};
</script>