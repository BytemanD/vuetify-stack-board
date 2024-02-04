<template>
  <v-row>
    <v-col>
      <v-data-table density='compact' show-select :loading="table.loading" :headers="table.headers" :items="table.items"
        :items-per-page="table.itemsPerPage" :search="table.search" v-model="table.selected">
        <template v-slot:top>
          <v-row>
            <v-col cols="12" md="6" sm="12">
              <v-toolbar density="compact" class="rounded-pill">
                <NewDomainDialog @completed="table.refresh()" />
                <v-spacer></v-spacer>
                <delete-comfirm-dialog :disabled="table.selected.length == 0" title="确定删除域?"
                  @click:comfirm="table.deleteSelected()" :items="table.getSelectedItems()" />
              </v-toolbar>
            </v-col>
            <v-col cols="12" md="4" sm="6">
              <v-text-field small density='compact' v-model="table.search" label="搜索" single-line
                hide-details></v-text-field>
            </v-col>
            <v-col cols="12" md="2" sm="12">
              <v-btn icon="mdi-refresh" variant="text" color="info" v-on:click="table.refresh()"></v-btn>
            </v-col>
          </v-row>
        </template>

        <template v-slot:[`item.enabled`]="{ item }">
          <v-switch :disabled="item.id == 'default'" v-model="item.enabled" hide-details color="success"
            @click="table.toggleEnabled(item)"></v-switch>
        </template>
      </v-data-table>
    </v-col>
  </v-row>
</template>

<script>
import { DomainTable } from '@/assets/app/tables';

import DeleteComfirmDialog from '@/components/plugins/dialogs/DeleteComfirmDialog.vue';
import NewDomainDialog from './dialogs/NewDomainDialog.vue';

export default {
  components: {
    NewDomainDialog, DeleteComfirmDialog,
  },

  data: () => ({
    table: new DomainTable(),
    showNewDoaminDialog: false,
  }),
  methods: {
    async refresh() {
      this.table.refresh();
    }
  },
  created() {
    this.refresh();
  }
};
</script>
