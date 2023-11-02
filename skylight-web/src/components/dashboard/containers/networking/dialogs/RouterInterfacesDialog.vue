<template>
  <v-dialog v-model="display" width="800">
    <v-card>
      <v-card-title class="headline primary lighten-2" primary-title>路由端口管理</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" class="mt-4">
            <h3>端口</h3>
            <span v-if="dialog.interfaces.length == 0">无</span>
            <v-chip label outlined close @click:close="dialog.remove(item)" color="info" class="ml-1 mt-1"
              v-for="(item, i) in dialog.interfaces" v-bind:key="i">
              <code>{{ item.fixed_ips[0].subnet_id }}</code>{{ item.fixed_ips[0].ip_address }}
            </v-chip>
          </v-col>
          <v-col cols="10">
            <v-select :items="dialog.subnets" label="可用子网" item-value="id" :item-props="dialog.itemProps" multiple chips outlined
              v-model="dialog.selected">
            </v-select>
          </v-col>
          <v-col cols="2"><v-btn color="primary" class="mx-auto" @click="dialog.attachSelected()">添加</v-btn></v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script>
import i18n from '@/assets/app/i18n';
import { Utils } from '@/assets/app/lib';

import { RouterInterfacesDialog } from '@/assets/app/dialogs';

export default {
  props: {
    show: Boolean, router: Object,
  },
  data: () => ({
    i18n: i18n,
    Utils: Utils,
    display: false,
    dialog: new RouterInterfacesDialog(),
  }),
  methods: {
    commit: async function () {
      await this.dialog.commit()
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
        this.dialog.init(this.router);
      }
    },
    display(newVal) {
      this.display = newVal;
      this.$emit("update:show", this.display);
    }
  },
};
</script>
