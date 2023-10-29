<template>
  <v-dialog v-model="display" width="600">
    <v-card>
      <v-card-title class="info" primary-title>卷扩容</v-card-title>
      <v-card-text>
        <v-slider v-model="newSize" thumb-label="always" ticks="always"
          label="新容量(GB)" class="mt-10"
          :min="minNewSize" :max="minNewSize + 100" step="10" :disabled="customNewSize!=null && customNewSize!=''">
        </v-slider>
        <v-text-field outlined label="自定义" class="mt-5" v-model="customNewSize" clearable
          :rules="volumeSizeRules"></v-text-field>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="commit()">确定</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import i18n from '@/assets/app/i18n';
import { Utils } from '@/assets/app/lib';

import { VolumeStateResetDialog } from '@/assets/app/dialogs';
import API from '@/assets/app/api';

export default {
  props: {
    show: Boolean,
    volumes: Array,
  },
  data: () => ({
    i18n: i18n,
    display: false,
    dialog: new VolumeStateResetDialog(),
    Utils: Utils,
    newSize: 0,
    minNewSize: 0,
    customNewSize: null,
    volumeSizeRules: [
      v => /^[0-9]*$/.test(v) || (v == null && true || "非法数值"),
    ]
  }),
  methods: {
    commit: async function () {
      for (let volume of this.volumes){
        API.volume.extend(volume.id, this.customNewSize || this.newSize)
      }
      this.display = false;
      this.$emit('completed');
    }
  },
  created() {

  },
  watch: {
    show(newVal) {
      this.display = newVal;
      if (this.display){
        this.minNewSize = 0;
        for(let volume of this.volumes) {
          this.minNewSize = Math.max(volume.size, this.minNewSize);
        }
        this.minNewSize += 10
      }
    },
    display(newVal) {
      this.display = newVal;
      this.$emit("update:show", this.display);
    }
  },
};
</script>