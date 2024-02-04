<template>
  <v-row>

    <v-col cols="12">
      <v-data-table show-expand single-expand density='compact' show-select :loading="table.loading"
        :headers="table.headers" :items="table.items" :items-per-page="table.itemsPerPage" :search="table.search"
        v-model="table.selected">

        <template v-slot:top>
          <v-row>
            <v-col cols="12" md="4" sm="12">
              <v-toolbar density="compact" class="rounded-pill">
                <NewProjectDialog @completed="table.refresh()" />
                <v-spacer></v-spacer>
                <delete-comfirm-dialog :disabled="table.selected.length == 0" title="确定删除项目?"
                  @click:comfirm="table.deleteSelected()" :items="table.getSelectedItems()"/>
              </v-toolbar>
            </v-col>
            <v-col cols="12" md="3" sm="4">
              <UserDialog :show.sync="showUserDialog" />
              <RoleDialog :show.sync="showRoleDialog" />
            </v-col>
            <v-col cols="12" md="4" sm="6">
              <v-text-field small density='compact' v-model="table.search" label="搜索" single-line
                hide-details></v-text-field>
            </v-col>
            <v-col cols="12" md="1" sm="2">
              <v-btn icon="mdi-refresh" variant="text" color="info" v-on:click="table.refresh()"><v-icon></v-icon></v-btn>
            </v-col>
          </v-row>
        </template>

        <template v-slot:[`item.name`]="{ item }">{{ item.name || item.id }}</template>
        <template v-slot:[`item.enabled`]="{ item }">
          <v-icon color="success" v-if="item.enabled == true">mdi-check-circle</v-icon>
          <v-icon color="red" v-else>mdi-close-circle</v-icon>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn variant='text' size="small" color="purple" @click="openProjectUserDialog(item)">用户管理</v-btn>
        </template>

        <template v-slot:expanded-row="{ columns, item }">
          <td></td>
          <td :colspan="columns.length - 1">
            <table>
              <tr v-for="extendItem in table.extendItems" v-bind:key="extendItem.text">
                <td class="text-info">{{ extendItem.title }}:</td>
                <td>{{ item[extendItem.title] }}</td>
              </tr>
            </table>
          </td>
        </template>
      </v-data-table>
      <ProjectUserDialog :show="showProjectUserDialog" :project="selectProject"
        @update:show="(e) => showProjectUserDialog = e" />
    </v-col>
  </v-row>
</template>

<script>
import I18N from '@/assets/app/i18n';
import { ProjectTable } from '@/assets/app/tables';

import DeleteComfirmDialog from '@/components/plugins/dialogs/DeleteComfirmDialog.vue';
import NewProjectDialog from './dialogs/NewProjectDialog.vue';
import UserDialog from './dialogs/UserDialog.vue';
import RoleDialog from './dialogs/RoleDialog.vue';
import ProjectUserDialog from './dialogs/ProjectUserDialog.vue';

export default {
  components: {
    NewProjectDialog, UserDialog, RoleDialog, ProjectUserDialog,
    DeleteComfirmDialog,
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
      this.selectProject = project;
      this.showProjectUserDialog = !this.showProjectUserDialog;
    }
  },
  created() {
    this.refresh();
  }
};
</script>
