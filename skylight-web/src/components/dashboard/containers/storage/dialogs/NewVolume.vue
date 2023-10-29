<template>
<v-dialog v-model="display" width="760" scrollable>
    <v-card>
      <v-card-title class="info" primary-title>新建卷</v-card-title>
      <v-card-text>
        <v-row>
          <v-col>
            <v-text-field label="名字" placeholder="请输入卷名" v-model="dialog.name" :rules="[dialog.checkNotNull]"></v-text-field>
          </v-col>
          <v-col cols="2" class="my-auto">
            <v-btn text color="primary" @click="dialog.refreshName()">随机名字</v-btn>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="4">
            <v-text-field density='compact' outlined label="大小(GB)" placeholder="请输入卷大小" v-model="dialog.params.size"></v-text-field>
            <v-select density='compact' outlined :items="dialog.params.types" clearable label="卷类型" item-text="name" item-value="id"
                v-model="dialog.params.type">
                <template v-slot:selection="{ item }"> {{ item.name }} </template>
            </v-select>
          <v-text-field label="数目" placeholder="请输入新建数量" v-model="dialog.params.nums" density='compact' outlined> </v-text-field>
          </v-col>
          <v-col>
            <v-select density='compact' outlined :items="dialog.params.images" clearable label="镜像" item-text="name" item-value="id"
                      v-model="dialog.params.image">
              <template v-slot:selection="{ item }"> {{ item.name || item.id }} </template>
            </v-select>
            <v-select density='compact' outlined :items="dialog.params.snapshots" clearable label="快照" item-text="name" item-value="id"
                      v-model="dialog.params.snapshot">
              <template v-slot:selection="{ item }"> {{ item.name || item.id }} </template>
            </v-select>
            <v-alert type="info" density='compact' text>镜像和快照不能同时选择,选择快照后不能选择类型。</v-alert>
          </v-col>
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
    props: {
        show: Boolean,
    },
    data: () => ({
        i18n: i18n,
        display: false,
        dialog: new NewVolumeDialog(),
        Utils: Utils
    }),
    methods: {
        commit: async function(){
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
            if(this.display){
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