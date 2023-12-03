<template>
  <v-dialog v-model="display" width="900" scrollable>
    <v-card>
      <v-card-title class="headline primary" primary-title>
        安全组: {{ dialog.securityGroup.name || dialog.securityGroup.id }}
      </v-card-title>
      <v-card-text class="pa-4">
        <v-btn size="small" fab color="primary" class="mr-1" @click="openNewSGRuleDialog()"><v-icon>mdi-plus</v-icon></v-btn>
        <v-btn size="small" color="red" @click="dialog.deleteSelected()" :disabled="dialog.selected.length == 0">删除</v-btn>
        <v-data-table :headers="dialog.headers" :items="dialog.securityGroup.security_group_rules"
          :items-per-page="dialog.itemsPerPage" :search="dialog.search" density='compact' show-select
          v-model="dialog.selected" show-expand single-expand>
          <template v-slot:[`item.port_range`]="{ item }">
            {{ item.port_range_min }}:{{ item.port_range_max }}
          </template>
          <template v-slot:expanded-row="{ columns, item }">
            <td></td>
            <td :colspan="columns.length - 1">
              <table>
                <tr v-for="extendItem in dialog.extendItems" v-bind:key="extendItem.text">
                  <td><strong>{{ extendItem.title }}:</strong> </td>
                  <td>{{ item[extendItem.key] }}</td>
                </tr>
              </table>
            </td>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <NewSGRule :show.sync="showNewSGRule" :securityGroup="securityGroup" @completed="dialog.refresh()" />
  </v-dialog>
</template>
<script>
import i18n from '@/assets/app/i18n';
import { Utils } from '@/assets/app/lib';

import { SGRulesDialog } from '@/assets/app/dialogs';
import NewSGRule from './NewSGRule.vue';

export default {
  components: {
    NewSGRule
  },
  props: {
    show: Boolean, securityGroup: Object,
  },
  data: () => ({
    i18n: i18n,
    Utils: Utils,
    display: false,
    dialog: new SGRulesDialog(),
    showNewSGRule: false,

  }),
  methods: {
    openNewSGRuleDialog: function () {
      this.showNewSGRule = !this.showNewSGRule;
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
        this.dialog.init(this.securityGroup);
      }
    },
    display(newVal) {
      this.display = newVal;
      this.$emit("update:show", this.display);
    }
  },
};
</script>
