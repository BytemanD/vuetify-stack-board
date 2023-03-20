<template>
  <v-row>
    <v-col>
      <v-btn x-small fab class="mr-1" color="primary" @click="showNewDoaminDialog = !showNewDoaminDialog"><v-icon>mdi-plus</v-icon></v-btn>
      <v-btn small color="error" @click="table.deleteSelected()">删除</v-btn>
    </v-col>
    <v-col>
      <v-text-field small dense v-model="table.search" append-icon="mdi-magnify" label="搜索" single-line
        hide-details></v-text-field>
    </v-col>
    <v-col cols="1" class="text-center">
      <v-btn fab x-small color="info" v-on:click="table.refresh()"><v-icon>mdi-refresh</v-icon></v-btn>
    </v-col>
    <v-col cols="12">
      <v-data-table dense show-select :loading="table.loading" :headers="table.headers" :items="table.items" :items-per-page="table.itemsPerPage"
        :search="table.search" v-model="table.selected">

        <template v-slot:[`item.enabled`]="{ item }">
          <v-switch class="my-auto" :disabled="item.id=='default'" v-model="item.enabled" hide-details @click="table.toggleEnabled(item)"></v-switch>
        </template>

      </v-data-table>
    </v-col>
    <NewDomainDialog :show.sync="showNewDoaminDialog" @completed="table.refresh()" />
  </v-row>
</template>

<script>
import { DomainTable } from '@/assets/app/tables';

import NewDomainDialog from './dialogs/NewDomainDialog.vue';

export default {
  components: {
    NewDomainDialog,
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
