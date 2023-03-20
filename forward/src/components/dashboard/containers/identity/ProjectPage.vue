<template>
  <v-row>
    <v-col>
      <v-btn small color="primary" @click="table.openNewItemDialog()">创建</v-btn>
      <v-btn small color="error" @click="table.deleteSelected()">删除</v-btn>
      <v-btn small color="info" v-on:click="identity.rolesDialog.open()">角色管理</v-btn>
      <v-btn small color="info" v-on:click="table.openUserTable()">用户管理</v-btn>
    </v-col>
    <v-col>
      <v-text-field small dense v-model="table.search" append-icon="mdi-magnify" label="搜索" single-line
        hide-details></v-text-field>
    </v-col>
    <v-col cols="1" class="text-center">
      <v-btn fab x-small color="info" v-on:click="table.refresh()"><v-icon>mdi-refresh</v-icon></v-btn>
    </v-col>
    <v-col cols="12">
      <v-data-table show-expand single-expand dense show-select :headers="table.headers" :items="table.items"
        :items-per-page="table.itemsPerPage" :search="table.search" v-model="table.selected">
        <template v-slot:[`item.name`]="{ item }">{{ item.name || item.id }}</template>
        <template v-slot:[`item.enabled`]="{ item }">
          <v-icon color="success" v-if="item.enabled == true">mdi-check-circle</v-icon>
          <v-icon color="error" v-else>mdi-close-circle</v-icon>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn text color="purple" @click="identity.projectUserDialog.open(item)">用户管理</v-btn>
        </template>

        <template v-slot:expanded-item="{ headers, item }">
          <td></td>
          <td :colspan="headers.length - 1">
            <table>
              <tr v-for="extendItem in table.extendItems" v-bind:key="extendItem.text">
                <td><strong>{{ extendItem.text }}:</strong> </td>
                <td>{{ item[extendItem.value] }}</td>
              </tr>
            </table>
          </td>
        </template>
      </v-data-table>
    </v-col>
  </v-row>
</template>

<script>
import I18N from '@/assets/app/i18n';
import { ProjectTable } from '@/assets/app/tables';


export default {
  components: {
  },

  data: () => ({
    I18N: I18N,
    table: new ProjectTable(),
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
