<template>
  <v-row>
    <v-col>
      <v-btn x-small fab class="mr-1" color="primary" @click="showNewEndpointDialog = !showNewEndpointDialog">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
      <v-btn small color="error" @click="table.deleteSelected()"><v-icon>mdi-trash-can</v-icon></v-btn>
    </v-col>
    <v-col>
      <v-btn small color="primary" class="mr-1" @click="showServiceDialog = !showServiceDialog">{{ I18N.t('service') }}</v-btn>
      <v-btn small color="primary" @click="showRegionDialog = !showRegionDialog">{{ I18N.t('region') }}</v-btn>
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
    <NewEndpointDialog :show.sync="showNewEndpointDialog" @completed="table.refresh()" />
    <ServiceDialogVue :show.sync="showServiceDialog" />
    <RegionDialogVue :show.sync="showRegionDialog" />
  </v-row>
</template>

<script>
import API from '@/assets/app/api';
import I18N from '@/assets/app/i18n';
import { EndpointTable } from '@/assets/app/tables';

import NewEndpointDialog from './dialogs/NewEndpointDialog.vue';
import ServiceDialogVue from './dialogs/ServiceDialog.vue';
import RegionDialogVue from './dialogs/RegionDialog.vue';

export default {
  components: {
    NewEndpointDialog, ServiceDialogVue, RegionDialogVue,
  },

  data: () => ({
    I18N: I18N,
    table: new EndpointTable(),
    showNewEndpointDialog: false,
    showServiceDialog: false,
    showRegionDialog: false,
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
