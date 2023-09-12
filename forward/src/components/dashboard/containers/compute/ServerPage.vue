<template>
  <v-row>
    <v-col>
      <v-btn x-small fab color="primary" class="mr-1" v-on:click="openNewServer = !openNewServer">
        <v-icon>mdi-plus</v-icon> </v-btn>
      <v-btn-toggle borderless class="mr-1">
        <v-btn small elevation="2" color="success" v-on:click="table.startSelected()"
          :disabled="table.selected.length == 0">开机</v-btn>
        <v-btn small elevation="2" color="warning" v-on:click="table.stopSelected()"
          :disabled="table.selected.length == 0">关机</v-btn>
      </v-btn-toggle>
      <v-btn-toggle borderless class="mr-1">
        <v-btn small elevation="2" color="success" v-on:click="table.unpauseSelected()"
          :disabled="table.selected.length == 0">开启</v-btn>
        <v-btn small elevation="2" color="warning" v-on:click="table.pauseSelected()"
          :disabled="table.selected.length == 0">暂停</v-btn>
      </v-btn-toggle>
      <v-menu offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn small color="primary" class="mr-1" v-bind="attrs" v-on="on" :disabled="table.selected.length == 0">
            <v-icon>mdi-menu</v-icon>重启
          </v-btn>
        </template>
        <v-list>
          <v-list-item small
            @click="table.rebootSelected('SOFT')"><v-list-item-title>软重启</v-list-item-title></v-list-item>
          <v-list-item small
            @click="table.rebootSelected('HARD')"><v-list-item-title>硬重启</v-list-item-title></v-list-item>
        </v-list>
      </v-menu>
      <v-btn small color="warning" class="mr-1" @click="showServerMigrateDialog = !showServerMigrateDialog"
        :disabled="table.selected.length == 0">迁移</v-btn>
      <v-btn small color="warning" class="mr-1" @click="showServerEventDiallog = !showServerEventDiallog"
        :disabled="table.selected.length == 0">疏散</v-btn>
      <v-btn small color="warning" class="mr-1" @click="showServerResetStateDialog = !showServerResetStateDialog"
        :disabled="table.selected.length == 0">状态重置</v-btn>
      <v-btn small color="error" @click="table.deleteSelected()" :disabled="table.selected.length == 0">
        <v-icon>mdi-trash-can</v-icon>
      </v-btn>
    </v-col>
    <v-col cols="2">
      <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-on:click="table.deleted = !table.deleted; table.refresh()" v-bind="attrs" v-on="on">
            <v-icon v-if="table.deleted" color="error">mdi-delete</v-icon>
            <v-icon v-else color="info">mdi-delete-off</v-icon>
          </v-btn>
        </template>
        显示未删除/已删除
      </v-tooltip>
      <BtnIcon icon="mdi-family-tree" toolTip="显示拓扑图" @click="openServerTopology = true" />
      <BtnIcon icon="mdi-refresh" color="info" toolTip="刷新" @click="table.refresh()" />
    </v-col>
    <v-col cols="4">
      <v-text-field small dense hide-details v-model="table.search" append-icon="mdi-magnify" label="搜索"
        single-line></v-text-field>
    </v-col>
    <v-col cols='12'>
      <v-data-table dense show-select show-expand single-expand :loading="table.loading" :headers="table.headers"
        :items="table.items" :items-per-page="table.itemsPerPage" :search="table.search" v-model="table.selected">
        <template v-slot:[`item.name`]="{ item }">
          {{ item.name }}
          <v-btn @click="openChangeServerNameDialog(item)" x-small icon><v-icon>mdi-pencil-minus</v-icon></v-btn>
          <v-btn @click="loginVnc(item)" x-small icon><v-icon>mdi-console</v-icon></v-btn>
        </template>
        <template v-slot:[`item.status`]="{ item }">
          <template v-if="item.status">
            <v-chip v-if="item.status.toUpperCase() == 'DELETED'" small label color="error">已删除</v-chip>
            <v-icon v-else-if="item.status.toUpperCase() == 'ACTIVE'" color="success">mdi-play-circle</v-icon>
            <v-icon v-else-if="item.status.toUpperCase() == 'SHUTOFF'" color="warning">mdi-stop-circle</v-icon>
            <v-icon v-else-if="item.status.toUpperCase() == 'PAUSED'" color="warning">mdi-pause-circle</v-icon>
            <v-icon v-else-if="item.status.toUpperCase() == 'ERROR'" color="error">mdi-alpha-x-circle</v-icon>
            <v-icon v-else-if="item.status.toUpperCase() == 'HARD_REBOOT'" color="warning"
              class="mdi-spin">mdi-rotate-right</v-icon>
            <v-icon
              v-else-if="['REBOOT', 'BUILD', 'REBUILD', 'RESIZE', 'VERIFY_RESIZE', 'MIGRATING'].indexOf(item.status.toUpperCase()) >= 0"
              color="warning" class="mdi-spin">mdi-rotate-right</v-icon>
            <span v-else>{{ item.status.toUpperCase() }}</span>
          </template>
          <template v-if="item['OS-EXT-STS:task_state'] && item['OS-EXT-STS:task_state'] != ''">
            <v-chip x-small>{{ i18n.t(item['OS-EXT-STS:task_state']) }}</v-chip>
          </template>
        </template>
        <template v-slot:[`item.power_state`]="{ item }">
          <v-icon v-if="item['OS-EXT-STS:power_state'] == 1" color="success">mdi-power-on</v-icon>
          <v-icon v-else-if="item['OS-EXT-STS:power_state'] == 3" color="warning">mdi-pause</v-icon>
          <v-icon v-else-if="item['OS-EXT-STS:power_state'] == 4" color="error">mdi-power-off</v-icon>
          <v-icon v-else-if="item['OS-EXT-STS:power_state'] != 0" color="warning" class="mdi-spin">mdi-loading</v-icon>
        </template>
        <template v-slot:[`item.addresses`]="{ item }">
          <template v-for="(addresses, j) in table.parseAddresses(item)">
            <div v-bind:key="j">
              <v-chip label x-small class="mr-1 mb-1">{{ addresses.join(' | ') }}</v-chip>
              <br />
            </div>
          </template>
        </template>
        <template v-slot:[`item.flavor`]="{ item }"><span class="cyan--text">{{ item.flavor && item.flavor.original_name
        }}</span></template>
        <template v-slot:[`item.image`]="{ item }">
          <span class="blue--text">{{ table.getImage(item).name }}</span>
          <v-icon small
            v-if="item['os-extended-volumes:volumes_attached'] && item['os-extended-volumes:volumes_attached'].length > 0">
            mdi-cloud</v-icon>
        </template>
        <template v-slot:[`item.action`]="{ item }">
          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon color="purple" v-bind="attrs" v-on="on"><v-icon small>mdi-dots-vertical</v-icon></v-btn>
            </template>
            <v-list dense>
              <v-list-item @click="openServerActionDialog(item)">
                <v-list-item-title>操作记录</v-list-item-title>
              </v-list-item>
              <v-list-item @click="openServerConsoleLogDialog(item)">
                <v-list-item-title>控制台日志</v-list-item-title>
              </v-list-item>
              <v-list-item @click="openChangeServerPasswordDialog(item)">
                <v-list-item-title>修改密码</v-list-item-title>
              </v-list-item>
              <v-list-item @click="openServerVolumesDialog(item)">
                <v-list-item-title>卷管理</v-list-item-title>
              </v-list-item>
              <v-list-item @click="openServerInterfacesDialog(item)">
                <v-list-item-title>网卡管理</v-list-item-title>
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
              <v-list-item @click="openServerRebuildDialog(item)">
                <v-list-item-title class="orange--text">重建</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
        <template v-slot:expanded-item="{ headers, item }">
          <td></td>
          <td :colspan="headers.length - 1">
            <v-simple-table dense>
              <template v-slot:default>
                <tbody>
                  <template v-for="extendItem in Object.keys(item)">
                    <tr v-bind:key="extendItem" v-if="table.columns.indexOf(extendItem) < 0">
                      <td class="info--text">{{ extendItem }}:</td>
                      <td v-if="extendItem == 'created'">{{ Utils.parseUTCToLocal(item[extendItem]) }}</td>
                      <td v-else-if="extendItem == 'updated'">{{ Utils.parseUTCToLocal(item[extendItem]) }}</td>
                      <td v-else-if="extendItem == 'fault'" class="error--text">{{ item[extendItem] && item[extendItem].message }}</td>
                      <td v-else>{{ item[extendItem] }}</td>
                    </tr>
                  </template>
                </tbody>
              </template>
            </v-simple-table>
          </td>
        </template>
      </v-data-table>
    </v-col>
    <NewServerDialog :show.sync="openNewServer" :table.sync="table" />
    <ServerTopology :show.sync="openServerTopology" />
    <ServerMigrateDialog :show.sync="showServerMigrateDialog" :servers="table.selected" :server-table.sync="table" />
    <ServerEvacuateDialog :show.sync="showServerEventDiallog" :servers="table.selected" />
    <ServerResetStateDialog :show.sync="showServerResetStateDialog" :servers="table.selected"
      @completed="table.refresh()" />
    <ChangeServerNameDialog :show.sync="showChangeNameDialog" :server="selectedServer" @completed="updateServer()" />
    <ServerActionDialog :show.sync="showServerActionDialog" :server="selectedServer" />
    <ServerConsoleLogDialog :show.sync="showServerConsoleLogDialog" :server="selectedServer" />
    <ServerChangePassword :show.sync="showChangePassowrdDialog" :server="selectedServer" />
    <ServerVolumes :show.sync="showServerVolumesDialog" :server="selectedServer" />
    <ServerInterfaces :show.sync="showServerInterfacesDialog" :server="selectedServer" @completed="table.refresh()" />
    <ServerUpdateSG :show.sync="showServerUpdateSGDialog" :server="selectedServer" />
    <ServerResize :show.sync="showServerResizeDialog" :server="selectedServer" :server-table.sync="table"
      @completed="table.refresh()" />
    <ServerRebuild :show.sync="showServerRebuildDialog" :server="selectedServer" :server-table.sync="table"
      @completed="table.refresh()" />
    <ServerGroupDialog :show.sync="showServerGroupDialog" :server="selectedServer" />
  </v-row>
</template>

<script>
import i18n from '@/assets/app/i18n';
import BtnIcon from '@/components/plugins/BtnIcon'
import API from '@/assets/app/api';
import { Utils } from '@/assets/app/lib';

import { ServerDataTable } from '@/assets/app/tables.js';

import NewServerDialog from './dialogs/NewServerDialog';
import ServerTopology from './dialogs/ServerTopology.vue';

import ChangeServerNameDialog from './dialogs/ChangeServerNameDialog.vue';
import ServerActionDialog from './dialogs/ServerActionDialog.vue';
import ServerMigrateDialog from './dialogs/ServerMigrateDialog.vue';
import ServerResetStateDialog from './dialogs/ServerResetStateDialog.vue';
import ServerConsoleLogDialog from './dialogs/ServerConsoleLogDialog.vue';
import ServerChangePassword from './dialogs/ServerChangePassword.vue';
import ServerVolumes from './dialogs/ServerVolumes.vue';
import ServerInterfaces from './dialogs/ServerInterfaces.vue';
import ServerUpdateSG from './dialogs/ServerUpdateSG.vue';
import ServerResize from './dialogs/ServerResize.vue';
import ServerRebuild from './dialogs/ServerRebuild.vue';
import ServerEvacuateDialog from './dialogs/ServerEvacuateDialog.vue';
import ServerGroupDialog from './dialogs/ServerGroupDialog.vue';

export default {
  props: {
    show: Boolean,
  },
  components: {
    BtnIcon, NewServerDialog, ServerTopology,
    ServerMigrateDialog, ServerEvacuateDialog, ServerResetStateDialog,
    ChangeServerNameDialog,
    ServerActionDialog,
    ServerConsoleLogDialog,
    ServerChangePassword,
    ServerVolumes, ServerInterfaces,
    ServerUpdateSG, ServerResize, ServerRebuild,
    ServerGroupDialog,
  },

  data: () => ({
    Utils: Utils,
    i18n: i18n,
    deleted: false,
    table: new ServerDataTable(),
    selectedServer: {},
    openNewServer: false,
    openServerTopology: false,
    showServerMigrateDialog: false,
    showServerResetStateDialog: false,
    showServerActionDialog: false,
    showServerConsoleLogDialog: false,
    showChangeNameDialog: false,
    showChangePassowrdDialog: false,
    showRenameDialog: false,
    showServerVolumesDialog: false,
    showServerInterfacesDialog: false,
    showServerUpdateSGDialog: false,
    showServerResizeDialog: false,
    showServerRebuildDialog: false,
    showServerEventDiallog: false,
    showServerGroupDialog: false
  }),
  methods: {
    refreshTable: function () {
      this.table.refresh();
    },
    updateServer: async function () {
      if (!this.selectedServer.id) {
        console.warn('server id is null');
        return;
      }
      let newServer = (await API.server.show(this.selectedServer.id)).server;
      for (let i in this.table.items) {
        if (this.table.items[i].id == this.selectedServer.id) {
          for (let key in this.table.items[i]) {
            if (!newServer[key]) {
              continue;
            }
            this.table.items[i][key] = newServer[key];
          }
          break;
        }
      }
    },
    loginVnc: async function (server) {
      let body = await API.server.getVncConsole(server.id);
      window.open(body.remote_console.url, '_blank');
    },
    openChangeServerNameDialog: async function (server) {
      this.selectedServer = server;
      this.showChangeNameDialog = !this.showChangeNameDialog;
    },
    openServerActionDialog: async function (server) {
      this.selectedServer = server;
      this.showServerActionDialog = !this.showServerActionDialog;
    },
    openServerConsoleLogDialog: async function (server) {
      this.selectedServer = server;
      this.showServerConsoleLogDialog = !this.showServerConsoleLogDialog;
    },
    openChangeServerPasswordDialog: async function (server) {
      this.selectedServer = server;
      this.showChangePassowrdDialog = !this.showChangePassowrdDialog;
    },
    openServerVolumesDialog: async function (server) {
      this.selectedServer = server;
      this.showServerVolumesDialog = !this.showServerVolumesDialog;
    },
    openServerInterfacesDialog: async function (server) {
      this.selectedServer = server;
      this.showServerInterfacesDialog = !this.showServerInterfacesDialog;
    },
    openServerUpdateSGDialog: async function (server) {
      this.selectedServer = server;
      this.showServerUpdateSGDialog = !this.showServerUpdateSGDialog;
    },
    openServerResizeDialog: async function (server) {
      this.selectedServer = server;
      this.showServerResizeDialog = !this.showServerResizeDialog;
    },
    openServerRebuildDialog: async function (server) {
      this.selectedServer = server;
      this.showServerRebuildDialog = !this.showServerRebuildDialog;
    },
    openServerGroupDialog: function (server) {
      this.selectedServer = server;
      this.showServerGroupDialog = !this.showServerGroupDialog;
    }
  },
  created() {
    this.table.refresh();
  }
};
</script>