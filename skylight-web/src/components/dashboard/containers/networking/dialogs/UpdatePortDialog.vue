<template>
  <v-dialog v-model="display" width="600" scrollable>
    <v-card>
      <v-card-title class="headline grey lighten-2" primary-title>
        更新端口: {{ dialog.port.name || dialog.port.id }}
      </v-card-title>
      <v-card-text>
        <br>
        <v-select density='compact' outlined clearable :items="dialog.securityGroups" label="安全组" item-value="id"
          item-title="name" v-model="dialog.portSGs" multiple></v-select>
        <v-select density='compact' outlined clearable :items="dialog.qosPolicies" label="QOS策略" item-value="id"
          item-title="name" v-model="dialog.portQosPolicy"></v-select>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="commit()">更新</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import i18n from '@/assets/app/i18n';
import { Utils } from '@/assets/app/lib';

import { UpdatePortDialog } from '@/assets/app/dialogs';

export default {
  props: {
    show: Boolean, port: Object,
  },
  data: () => ({
    i18n: i18n,
    Utils: Utils,
    display: false,
    dialog: new UpdatePortDialog(),
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
        this.dialog.init(this.port);
      }
    },
    display(newVal) {
      this.display = newVal;
      this.$emit("update:show", this.display);
    }
  },
};
</script>
