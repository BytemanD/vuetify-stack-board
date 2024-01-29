<template>
  <v-dialog v-model="display" width="740">
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" icon="mdi-plus" fab color="primary" class="mr-1"></v-btn>
    </template>
    <v-card>
      <v-card-title class="headline primary" primary-title>新建备份</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-text-field label="名字" placeholder="请输入备份名" v-model="dialog.name"
              :rules="[dialog.checkNotNull]">
              <template v-slot:append>
                <v-btn variant="text" color="primary" @click="dialog.randomName()">随机名字</v-btn>
              </template>
            </v-text-field>
          </v-col>
          <v-col>
            <v-select hide-details :items="dialog.volumes" label="请选择卷" item-value="id" :item-props="dialog.itemProps"
              outlined v-model="dialog.volume_id">
            </v-select>
            <v-switch hide-details v-model="dialog.force" label="强制" color="warning"></v-switch>
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="commit()">创建</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import i18n from '@/assets/app/i18n';
import { Utils } from '@/assets/app/lib';
import { NewBackupDialog } from '@/assets/app/dialogs';

export default {
  props: {
  },
  data: () => ({
    i18n: i18n,
    display: false,
    dialog: new NewBackupDialog(),
    Utils: Utils
  }),
  methods: {
    commit: async function () {
      await this.dialog.commit();
      this.display = false;
      this.$emit('completed');
    }
  },
  created() {

  },
  watch: {
    display(newVal) {
      if (this.display) {
        this.dialog.init();
      }
      this.display = newVal;
      this.$emit("update:show", this.display);
    }
  },
};
</script>