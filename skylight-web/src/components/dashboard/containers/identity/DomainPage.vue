<template>
  <v-row>
    <v-col>
      <v-data-table density='compact' show-select :loading="table.loading" :headers="table.headers" :items="table.items"
        :items-per-page="table.itemsPerPage" :search="table.search" v-model="table.selected">
        <template v-slot:top>
          <v-row>
            <v-col cols="12" md="6" sm="12">
              <v-toolbar density="compact" class="rounded-pill">
                <NewDomainDialog @completed="table.refresh()"/>
                <v-spacer></v-spacer>
                <v-btn icon="mdi-trash-can" color="red" @click="table.deleteSelected()"></v-btn>
              </v-toolbar>
            </v-col>
            <v-col cols="12" md="4" sm="6">
              <v-text-field small density='compact' v-model="table.search" label="搜索" single-line
                hide-details></v-text-field>
            </v-col>
            <v-col cols="12" md="2" sm="12">
              <v-btn icon="mdi-refresh" variant="text" color="info" v-on:click="table.refresh()"><v-icon></v-icon></v-btn>
            </v-col>
          </v-row>
        </template>

        <template v-slot:[`item.enabled`]="{ item }">
          <v-switch class="my-auto" :disabled="item.id == 'default'" v-model="item.enabled" hide-details
            @click="table.toggleEnabled(item)"></v-switch>
        </template>

      </v-data-table>
    </v-col>

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
