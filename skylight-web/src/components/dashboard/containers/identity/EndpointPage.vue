<template>
  <v-row>
    <v-col cols="12">
      <v-data-table density='compact' show-select :headers="table.headers" :items="table.items"
        :items-per-page="table.itemsPerPage" :search="table.search" v-model="table.selected" :loading="table.loading">

        <template v-slot:top>
          <v-row>
            <v-col cols="12" md="5" sm="12">
              <v-toolbar density="compact" class="rounded-pill">
                <NewEndpointDialog @completed="table.refresh()" />
                <v-spacer></v-spacer>
                <delete-comfirm-dialog :disabled="table.selected.length == 0" title="确定删除Endpoint?"
                  @click:comfirm="table.deleteSelected()" :items="table.getSelectedItems()" :item-value-func="getItemValue" />
              </v-toolbar>
            </v-col>
            <v-col cols="12" md="2" sm="12">
              <ServiceDialogVue :show.sync="showServiceDialog" />
              <RegionDialogVue :show.sync="showRegionDialog" />
            </v-col>
            <v-col cols="12" md="4" sm="12">
              <v-text-field small density='compact' single-line hide-details v-model="table.search"
                label="搜索"></v-text-field>

            </v-col>
            <v-col cols="12" md="1" sm="12">
              <v-btn color="info" icon="mdi-refresh" variant="text" v-on:click="table.refresh()"></v-btn>
            </v-col>
          </v-row>
        </template>

        <template v-slot:[`item.service_name`]="{ item }">{{ serviceMap[item.service_id] && serviceMap[item.service_id].name }}</template>
        <template v-slot:[`item.service_type`]="{ item }">{{ serviceMap[item.service_id] &&  serviceMap[item.service_id].type }}</template>

      </v-data-table>
    </v-col>
  </v-row>
</template>

<script>
import API from '@/assets/app/api';
import I18N from '@/assets/app/i18n';
import { EndpointTable } from '@/assets/app/tables';

import DeleteComfirmDialog from '@/components/plugins/dialogs/DeleteComfirmDialog.vue';
import NewEndpointDialog from './dialogs/NewEndpointDialog.vue';
import ServiceDialogVue from './dialogs/ServiceDialog.vue';
import RegionDialogVue from './dialogs/RegionDialog.vue';

export default {
  components: {
    NewEndpointDialog, ServiceDialogVue, RegionDialogVue, DeleteComfirmDialog,
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
    },
    getItemValue(endpoint){
      let service = this.serviceMap[endpoint.service_id];
      return `${endpoint.url} (${endpoint.region} -> ${service.name} -> ${endpoint.interface})`

    }
  },
  created() {
    this.refresh();
  }
};
</script>
