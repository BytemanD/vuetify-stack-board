<template>
  <v-dialog v-model="display" width="500">
    <v-card>
      <v-card-title class="warning" primary-title>重置备份状态</v-card-title>
      <v-card-text>
        <v-select outlined hide-details class="mt-4" :items="dialog.statusList" label="重置为" v-model="dialog.status">
        </v-select>
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

import { BackupResetStateDialog } from '@/assets/app/dialogs';

export default {
  props: {
    show: Boolean,
    backups: Array,
  },
  data: () => ({
    i18n: i18n,
    display: false,
    dialog: new BackupResetStateDialog(),
    Utils: Utils
  }),
  methods: {
    commit: async function () {
      try {
        await this.dialog.commit(this.backups);
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