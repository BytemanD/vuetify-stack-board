<template>
  <v-row>
    <v-col>
      <v-btn x-small fab class="mr-1" color="primary"
        @click="showNewProjectDialog = !showNewProjectDialog"><v-icon>mdi-plus</v-icon>
      </v-btn>
      <v-btn small class="mr-1" color="error" @click="table.deleteSelected()">删除</v-btn>
      <v-btn small class="mr-1" color="info" v-on:click="showRoleDialog = !showRoleDialog">角色管理</v-btn>
      <v-btn small class="mr-1" color="info" v-on:click="showUserDialog = !showUserDialog">用户管理</v-btn>
    </v-col>
    <v-col>
      <v-text-field small dense v-model="table.search" append-icon="mdi-magnify" label="搜索" single-line
        hide-details></v-text-field>
    </v-col>
    <v-col cols="1" class="text-center">
      <v-btn fab x-small color="info" v-on:click="table.refresh()"><v-icon>mdi-refresh</v-icon></v-btn>
    </v-col>
    <v-col cols="12">
      <v-data-table show-expand single-expand dense show-select :loading="table.loading" :headers="table.headers"
        :items="table.items" :items-per-page="table.itemsPerPage" :search="table.search" v-model="table.selected">
        <template v-slot:[`item.name`]="{ item }">{{ item.name || item.id }}</template>
        <template v-slot:[`item.enabled`]="{ item }">
          <v-icon color="success" v-if="item.enabled == true">mdi-check-circle</v-icon>
          <v-icon color="error" v-else>mdi-close-circle</v-icon>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn text color="purple" @click="openProjectUserDialog(item)">用户管理</v-btn>
        </template>

        <template v-slot:expanded-item="{ headers, item }">
          <td></td>
          <td :colspan="headers.length - 1">
            <table>
              <tr v-for="extendItem in table.extendItems" v-bind:key="extendItem.text">
                <td class="info--text">{{ extendItem.text }}:</td>
                <td>{{ item[extendItem.value] }}</td>
              </tr>
            </table>
          </td>
        </template>
      </v-data-table>
    </v-col>
    <NewProjectDialog :show.sync="showNewProjectDialog" @completed="table.refresh()" />
    <UserDialog :show.sync="showUserDialog" />
    <RoleDialog :show.sync="showRoleDialog" />
    <ProjectUserDialog :show.sync="showProjectUserDialog" :project="selectProject" />
  </v-row>
</template>

<script>
import I18N from '@/assets/app/i18n';
import { ProjectTable } from '@/assets/app/tables';

import NewProjectDialog from './dialogs/NewProjectDialog.vue';
import UserDialog from './dialogs/UserDialog.vue';
import RoleDialog from './dialogs/RoleDialog.vue';
import ProjectUserDialog from './dialogs/ProjectUserDialog.vue';

export default {
  components: {
    NewProjectDialog, UserDialog, RoleDialog, ProjectUserDialog
  },

  data: () => ({
    I18N: I18N,
    table: new ProjectTable(),
    showNewProjectDialog: false,
    showRoleDialog: false,
    showUserDialog: false,
    showProjectUserDialog: false,
    selectProject: null,
  }),
  methods: {
    async refresh() {
      this.table.refresh();
    },
    openProjectUserDialog: function (project) {
      this.showProjectUserDialog = true;
      this.selectProject = project;
    }
  },
  created() {
    this.refresh();
  }
};
</script>
