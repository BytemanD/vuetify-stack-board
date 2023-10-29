<template>
<v-dialog v-model="display" width="740">
    <v-card>
        <v-card-title class="headline primary" primary-title>新建快照</v-card-title>
        <v-card-text>
            <v-row>
                <v-col cols="10">
                    <v-text-field label="名字" placeholder="请输入快照名" v-model="dialog.name" :rules="[dialog.checkNotNull]"></v-text-field>
                </v-col>
                <v-col cols="2" class="my-auto">
                    <v-btn text color="primary" @click="dialog.randomName()">随机名字</v-btn>
                </v-col>
                <v-col>
                    <v-select hide-details :items="dialog.volumes" label="请选择卷" item-text="name"
                        item-value="id" density='compact' outlined v-model="dialog.volume_id">
                        <template v-slot:selection="{ item }"> {{ item.name || item.id }} </template>
                    </v-select>
                    <v-switch color="warning" v-model="dialog.force" label="强制" hint="非强制模式下，只能对可用状态的卷创建快照。" persistent-hint></v-switch>
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
import { NewSnapshotDialog } from '@/assets/app/dialogs';

export default {
  props: {
    show: Boolean,
  },
  data: () => ({
    i18n: i18n,
    display: false,
    dialog: new NewSnapshotDialog(),
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
    show(newVal) {
      this.display = newVal;
      if (this.display) {
        this.dialog.init();
      }
    },
    display(newVal) {
      this.display = newVal;
      this.$emit("update:show", this.display);
    }
  },
};
</script>