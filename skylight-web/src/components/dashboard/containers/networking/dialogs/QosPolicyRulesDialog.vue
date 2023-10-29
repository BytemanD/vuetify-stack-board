<template>
<v-dialog v-model="display" width="1000" scrollable>
    <v-card>
        <v-card-title class="headline primary lighten-2" primary-title>
            QoS策略: {{ dialog.qosPolicy.name || dialog.qosPolicy.id }}
        </v-card-title>
        <v-card-text class="pt-4">
            <v-btn x-small fab class="mr-1" color="primary" @click="openNewQosPolicyRuleDialog(dialog)"><v-icon>mdi-plus</v-icon></v-btn>
            <v-btn small color="red" @click="dialog.deleteSelected()" :disabled="dialog.selected.length == 0" >删除</v-btn>
            <br>
            <v-data-table :headers="dialog.headers" :items="dialog.qosPolicy.rules"
                :items-per-page="dialog.itemsPerPage" :search="dialog.search"
                density='compact' show-select v-model="dialog.selected">
            </v-data-table>
        </v-card-text>
    </v-card>
    <NewQoSPolicyRule :show.sync="showNewRuleDialog" :qos-policy="qosPolicy" @completed="dialog.refresh()" /> 
</v-dialog>
</template>
<script>
import i18n from '@/assets/app/i18n';
import { Utils } from '@/assets/app/lib';

import { QosPolicyRules } from '@/assets/app/dialogs';
import NewQoSPolicyRule from './NewQoSPolicyRule.vue';


export default {
  components: {
    NewQoSPolicyRule,
  },
  props: {
    show: Boolean, qosPolicy: Object,
  },
  data: () => ({
    i18n: i18n,
    Utils: Utils,
    display: false,
    dialog: new QosPolicyRules(),
    showNewRuleDialog: false,
    
  }),
  methods: {
    openNewQosPolicyRuleDialog: function(){
      this.showNewRuleDialog = !this.showNewRuleDialog;
    },
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
        this.dialog.init(this.qosPolicy);
      }
    },
    display(newVal) {
      this.display = newVal;
      this.$emit("update:show", this.display);
    }
  },
};
</script>
