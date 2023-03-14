<template>
  <v-row>
    <v-col>
      <v-btn small color="primary" @click="table.newItemDialog.open()"><v-icon>mdi-plus</v-icon></v-btn>
      <v-btn small color="error" @click="table.deleteSelected()"><v-icon>mdi-trash-can</v-icon></v-btn>
    </v-col>
    <v-col>
      <v-btn small color="primary" @click="table.serviceDialog.open()">{{ I18N.t('service') }}</v-btn>
      <v-btn small color="primary" @click="table.regionDialog.open()">{{ I18N.t('region') }}</v-btn>
    </v-col>
    <v-col>
      <v-text-field small dense single-line hide-details v-model="table.search" append-icon="mdi-magnify"
        label="搜索"></v-text-field>
    </v-col>
    <v-col cols="1" class="text-center">
      <v-btn fab x-small color="info" v-on:click="table.refresh()"><v-icon>mdi-refresh</v-icon></v-btn>
    </v-col>
    <v-col cols="12">
      <v-data-table dense show-select :headers="table.headers" :items="table.items" :items-per-page="table.itemsPerPage"
        :search="table.search" v-model="table.selected">

        <template v-slot:[`item.service_name`]="{ item }">{{ serviceMap[item.service_id].name }}</template>
        <template v-slot:[`item.service_type`]="{ item }">{{ serviceMap[item.service_id].type }}</template>
      </v-data-table>
    </v-col>
  </v-row>
</template>

<script>
import API from '@/assets/app/api';
import I18N from '@/assets/app/i18n';
import { EndpointTable } from '@/assets/app/tables';


export default {
  components: {
  },

  data: () => ({
    I18N: I18N,
    table: new EndpointTable(),
    serviceMap: {},
  }),
  methods: {
    async getServices() {
      let body = await API.service.list()
      body.services.forEach(item => {
        this.serviceMap[item.id] = item
      });
    },
    async refresh() {
      await this.getServices();
      this.table.refresh();
    }
  },
  created() {
    this.refresh();
  }
};
</script>
