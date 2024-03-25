<template>
  <v-dialog v-model="display" width="960" scrollable>
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" icon="mdi-plus" fab color="primary" class="mr-1"></v-btn>
    </template>

    <v-card>
      <v-card-title class="info" primary-title>新建卷</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="10">
            <v-text-field label="名字" placeholder="请输入卷名" v-model="dialog.name" hide-details
              :rules="[dialog.checkNotNull]"></v-text-field>
          </v-col>
          <v-col cols="2" class="my-auto">
            <v-btn variant="text" color="primary" @click="dialog.refreshName()">随机名字</v-btn>
          </v-col>
          <v-col cols="6">
            <v-select density='compact' outlined :items="dialog.params.types" clearable label="卷类型" item-title="name"
              item-value="name" v-model="dialog.params.type" hide-details></v-select>
          </v-col>
          <v-col cols="4">
            <v-text-field density='compact' outlined label="大小(GB)" placeholder="请输入卷大小" hide-details
              v-model="dialog.params.size"></v-text-field>
          </v-col>
          <v-col cols="2">
            <v-text-field hide-details label="数量" placeholder="请输入新建数量" type="number" v-model="dialog.params.nums" density='compact'
              outlined>
            </v-text-field>
          </v-col>
          <v-col cols="6">
            <v-select density='compact' outlined hide-details :items="dialog.params.images" clearable label="镜像"
              item-value="id" :item-props="dialog.itemProps" v-model="dialog.params.image">
            </v-select>
          </v-col>
          <v-col cols="6">
            <v-select density='compact' outlined hide-details :items="dialog.params.snapshots" clearable label="快照"
            :item-props="dialog.itemProps" item-value="id" v-model="dialog.params.snapshot">
            </v-select>
          </v-col>
          <v-alert type="info" density='compact' variant="text">
            镜像和快照不能同时选择, 选择快照后不能选择类型。
          </v-alert>
        </v-row>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="dialog.commit()">创建</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import i18n from '@/assets/app/i18n';
import { NewVolumeDialog } from '@/assets/app/dialogs';
import { Utils } from '@/assets/app/lib';

export default {
  data: () => ({
    i18n: i18n,
    display: false,
    dialog: new NewVolumeDialog(),
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
      this.display = newVal;
      if (this.display) {
        this.dialog.init();
      }
      this.$emit("update:show", this.display);
    }
  },
};
</script>