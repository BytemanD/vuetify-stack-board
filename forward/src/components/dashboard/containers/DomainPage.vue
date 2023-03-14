<template>
  <v-row>
    <v-col>
      <v-btn small color="primary" @click="table.openNewItemDialog()">创建</v-btn>
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
      <v-data-table dense show-select :headers="table.headers" :items="table.items" :items-per-page="table.itemsPerPage"
        :search="table.search" v-model="table.selected">

        <template v-slot:[`item.enabled`]="{ item }">
          <v-switch class="my-auto" v-model="item.enabled" hide-details @click="table.toggleEnabled(item)"></v-switch>
        </template>

      </v-data-table>
    </v-col>
  </v-row>
</template>

<script>
import I18N from '@/assets/app/i18n';
import { DomainTable } from '@/assets/app/tables';


export default {
  components: {
  },

  data: () => ({
    I18N: I18N,
    table: new DomainTable(),
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
