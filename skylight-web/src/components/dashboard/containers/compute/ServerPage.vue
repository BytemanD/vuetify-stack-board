<template>
  <v-row>
    <v-col cols='12'>
      <v-data-table-server density='compact' show-select show-expand single-expand :loading="table.loading"
        :headers="table.headers" :items="table.items" :items-per-page="table.itemsPerPage" :search="table.search"
        v-model="table.selected" :items-length="totalServers.length" @update:options="pageRefresh" hover>

        <template v-slot:top>
          <v-row>
            <v-col cols="12" md="7" sm="12">
              <v-toolbar density="compact" class="rounded-pill">
                <v-btn icon="mdi-plus" color="primary" @click="() => { newServer() }"></v-btn>
                <v-spacer></v-spacer>
                <v-btn color="success" @click="table.startSelected()" :disabled="table.selected.length == 0"
                  class="pa-0">
                  {{ $t('start') }}</v-btn>
                <v-btn color="warning" v-on:click="table.stopSelected()" :disabled="table.selected.length == 0"
                  class="pa-0">
                  {{ $t('stop') }}
                </v-btn>
                <btn-server-reboot :servers="table.selected" @updateServer="updateServer" />
                <btn-server-migrate :servers="table.selected" @updateServer="updateServer" />
                <btn-server-evacuate :servers="table.selected" @updateServer="updateServer" />
                <btn-server-reset-state :servers="table.selected"
                  @updateServer="(server) => { table.updateItem(server) }" />

                <v-spacer></v-spacer>
                <delete-comfirm-dialog :disabled="table.selected.length == 0" title="确定删除实例?"
                  @click:comfirm="deleteSelected()" :items="table.getSelectedItems()" />
              </v-toolbar>
            </v-col>
            <v-col cols="12" md="3" sm="6">
              <v-text-field density='compact' hide-details single-line v-model="table.filterName" label="搜索实例名"
                @keyup.enter.native="refreshTable()"></v-text-field>
            </v-col>
            <v-col cols="12" md="2" sm="6">
              <BtnIcon variant="text" icon="mdi-refresh" color="info" tool-tip="刷新" @click="pageRefresh(1)" />
              <v-tooltip bottom>
                <template v-slot:activator="{ props }">
                  <v-btn icon variant="text" v-on:click="table.deleted = !table.deleted; pageRefresh(1)" v-bind="props">
                    <v-icon v-if="table.deleted" color="red">mdi-delete</v-icon>
                    <v-icon v-else color="info">mdi-delete-off</v-icon>
                  </v-btn>
                </template>
                显示未删除/已删除
              </v-tooltip>
              <BtnIcon variant="text" icon="mdi-family-tree" tool-tip="显示拓扑图" @click="openServerTopology = true" />
            </v-col>
          </v-row>
        </template>

        <template v-slot:[`item.name`]="{ item }">
          <!-- 状态 -->
          <chip-link v-if="item.status" hide-link-icon color="default" density="compact"
            :link="'/dashboard/server/' + item.id" :label="item.name">
            <template v-slot:append>
              <div class="ml-1">
                <v-chip v-if="item.status.toUpperCase() == 'DELETED'" size='small' label color="red">已删除</v-chip>
                <v-icon v-else-if="item.status.toUpperCase() == 'ACTIVE'" color="success">mdi-play</v-icon>
                <v-icon v-else-if="item.status.toUpperCase() == 'SHUTOFF'" color="warning">mdi-stop</v-icon>
                <v-icon v-else-if="item.status.toUpperCase() == 'PAUSED'" color="warning">mdi-pause</v-icon>
                <v-icon v-else-if="item.status.toUpperCase() == 'ERROR'" size='small'
                  color="red">mdi-alpha-x-circle</v-icon>
                <v-icon v-else-if="item.status.toUpperCase() == 'HARD_REBOOT'" size='small' color="warning"
                  class="mdi-spin">mdi-rotate-right</v-icon>
                <v-icon
                  v-else-if="['REBOOT', 'BUILD', 'REBUILD', 'RESIZE', 'VERIFY_RESIZE', 'MIGRATING'].indexOf(item.status.toUpperCase()) >= 0"
                  color="warning" class="mdi-spin">mdi-rotate-right</v-icon>
                <span v-else>{{ item.status.toUpperCase() }}</span>
              </div>
            </template>
          </chip-link>

          <div v-if='item["OS-EXT-STS:task_state"]' class="text-warning text-center">
            {{ $t(item["OS-EXT-STS:task_state"]) }} ...
          </div>
        </template>
        <template v-slot:[`item.power_state`]="{ item }">
          <v-icon size='small' v-if="item['OS-EXT-STS:power_state'] == 1" color="success">mdi-power</v-icon>
          <v-icon size='small' v-else-if="item['OS-EXT-STS:power_state'] == 3" color="warning">mdi-pause</v-icon>
          <v-icon size='small' v-else-if="item['OS-EXT-STS:power_state'] == 4" color="red">mdi-power</v-icon>
          <v-icon size='small' v-else-if="item['OS-EXT-STS:power_state'] != 0" color="warning"
            class="mdi-spin">mdi-loading</v-icon>
        </template>
        <template v-slot:[`item.addresses`]="{ item }">
          <v-chip v-if="Object.keys(item.addresses).length > 0" label size="x-small" class="mr-1 mb-1">
            {{ table.parseFirstAddresses(item).join(' | ') }}
          </v-chip>
          <span v-if="Object.keys(item.addresses).length > 1">...</span>
        </template>
        <template v-slot:[`item.flavor`]="{ item }">
          <span class="text-cyan"> {{ item.flavor && item.flavor.original_name }}</span>
        </template>
        <template v-slot:[`item.image`]="{ item }">
          <span class="text-info">{{ table.imageName[item.image.id] }}</span>
          <template> {{ table.updateImageName(item) }} </template>
          <v-icon size="x-small" class="ml-1"
            v-if="item['os-extended-volumes:volumes_attached'] && item['os-extended-volumes:volumes_attached'].length > 0">
            mdi-cloud</v-icon>
        </template>
        <template v-slot:[`item.action`]="{ item }">
          <v-btn @click="openChangeServerNameDialog(item)" size="x-small" icon="mdi-pencil-minus"
            variant="text"></v-btn>
          <v-btn @click="loginVnc(item)" size="x-small" icon="mdi-console" variant="text"></v-btn>
          <v-menu offset-y>
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-dots-vertical" size="x-small" color="purple" variant="text" v-bind="props"></v-btn>
            </template>
            <v-list density='compact'>
              <v-list-item @click="openServerUpdateSGDialog(item)">
                <v-list-item-title>重命名</v-list-item-title>
              </v-list-item>
              <v-list-item @click="openServerUpdateSGDialog(item)">
                <v-list-item-title>更新安全组</v-list-item-title>
              </v-list-item>
              <v-list-item @click="openServerGroupDialog(item)">
                <v-list-item-title>查看群组</v-list-item-title>
              </v-list-item>
              <v-list-item @click="openServerResizeDialog(item)">
                <v-list-item-title class="orange--text">规格变更</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
        <template v-slot:expanded-row="{ columns, item }">
          <td></td>
          <td :colspan="columns.length - 1">
            <v-table density='compact'>
              <template v-slot:default>
                <tr v-for="extendItem in table.extendItems" v-bind:key="extendItem.key">
                  <td class="text-info">{{ extendItem.title }}:</td>
                  <td v-if="extendItem == 'created'">{{ Utils.parseUTCToLocal(item[extendItem]) }}</td>
                  <td v-else-if="extendItem == 'updated'">{{ Utils.parseUTCToLocal(item[extendItem]) }}</td>
                  <td v-else-if="extendItem == 'fault'" class="error--text">{{ item[extendItem] &&
                    item[extendItem].message }}</td>
                  <td v-else>{{ item[extendItem.key] }}</td>
                </tr>
              </template>
            </v-table>
          </td>
        </template>
      </v-data-table-server>
    </v-col>

    <ServerTopology :show="openServerTopology" />
    <ChangeServerNameDialog :show="showChangeNameDialog" :server="selectedServer"
      @update:show="(e) => showChangeNameDialog = e" />
    <ServerUpdateSG :show="showServerUpdateSGDialog" @update:show="(e) => showServerUpdateSGDialog = e"
      :server="selectedServer" />
    <ServerGroupDialog :show="showServerGroupDialog" @update:show="(e) => showServerGroupDialog = e"
      :server="selectedServer" />
  </v-row>
</template>

<script>
import i18n from '@/assets/app/i18n';
import BtnIcon from '@/components/plugins/BtnIcon'
import API from '@/assets/app/api';
import { Utils } from '@/assets/app/lib';

import { ServerDataTable } from '@/assets/app/tables.jsx';

import ServerTopology from './dialogs/ServerTopology.vue';
import ChipLink from '@/components/plugins/ChipLink.vue';
import ChangeServerNameDialog from './dialogs/ChangeServerNameDialog.vue';
import ServerUpdateSG from './dialogs/ServerUpdateSG.vue';
import ServerGroupDialog from './dialogs/ServerGroupDialog.vue';
import BtnServerResetState from '@/components/plugins/button/BtnServerResetState.vue';

import DeleteComfirmDialog from '@/components/plugins/dialogs/DeleteComfirmDialog.vue';
import BtnServerMigrate from '@/components/plugins/BtnServerMigrate.vue';
import BtnServerReboot from '@/components/plugins/BtnServerReboot.vue';
import BtnServerEvacuate from '@/components/plugins/BtnServerEvacuate.vue';


export default {
  components: {
    BtnIcon, ServerTopology, ChipLink,
    BtnServerMigrate,
    BtnServerResetState,
    ChangeServerNameDialog,
    ServerUpdateSG,
    ServerGroupDialog,
    DeleteComfirmDialog,
    BtnServerReboot, BtnServerEvacuate,
  },

  data: () => ({
    Utils: Utils,
    i18n: i18n,
    deleted: false,
    table: new ServerDataTable(),
    selectedServer: {},
    openServerTopology: false,
    showChangeNameDialog: false,
    showServerUpdateSGDialog: false,
    showServerGroupDialog: false,

    totalServers: [],
  }),
  methods: {
    refreshTable: function () {
      this.table.refresh();
    },
    deleteSelected: async function () {
      let selected = this.table.selected;
      await this.table.deleteSelected()
      for (let i in selected) {
        let serverId = selected[i];
        await this.table.waitServerDeleted(serverId)
      }
      this.refreshTotlaServers()
    },
    refreshTotlaServers: function () {
      let self = this;
      let filter = { 'deleted': this.table.deleted }
      API.server.list(filter).then((servers) => {
        self.totalServers = servers
      })
    },
    pageRefresh: function ({ page, itemsPerPage, sortBy }) {
      let filter = {}
      if (itemsPerPage) {
        if (itemsPerPage >= 0) {
          filter.limit = itemsPerPage
        }
      } else {
        filter.limit = this.table.itemsPerPage
      }
      if (page > 1 && this.totalServers.length > 1) {
        let index = filter.limit * (page - 1) - 1
        filter.marker = this.totalServers[index].id
      }
      this.table.refresh(filter)
      this.refreshTotlaServers()
    },
    updateServer: async function (server) {
      if (!server.id) {
        console.warn('server id is null');
        return;
      }
      for (let i in this.table.items) {
        if (this.table.items[i].id == server.id) {
          for (let key in server) {
            this.table.items[i][key] = server[key];
          }
          break;
        }
      }
    },
    loginVnc: async function (server) {
      let body = await API.server.getVncConsole(server.id);
      window.open(body.remote_console.url, '_blank');
    },
    newServer: function () {
      const { href } = this.$router.resolve({ path: '/dashboard/server/new' });
      window.open(href, '_blank');
    },
    openChangeServerNameDialog: async function (server) {
      this.selectedServer = server;
      this.showChangeNameDialog = !this.showChangeNameDialog;
    },
    openServerUpdateSGDialog: async function (server) {
      this.selectedServer = server;
      this.showServerUpdateSGDialog = !this.showServerUpdateSGDialog;
    },
    openServerResizeDialog: async function (server) {
      this.selectedServer = server;
      this.showServerResizeDialog = !this.showServerResizeDialog;
    },
    openServerGroupDialog: function (server) {
      this.selectedServer = server;
      this.showServerGroupDialog = !this.showServerGroupDialog;
    }
  },
  created() {
  }
};
</script>