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
      <v-btn small color="primary" class="mr-1" @click="migrateDialog.open()"
        :disabled="table.selected.length == 0">迁移</v-btn>
      <v-btn small color="warning" class="mr-1" @click="evacuateDialog.open()"
        :disabled="table.selected.length == 0">疏散</v-btn>
      <v-btn small color="warning" class="mr-1" @click="table.openResetStateDialog()"
        :disabled="table.selected.length == 0">状态重置</v-btn>
      <v-btn small color="error" @click="table.deleteSelected()" :disabled="table.selected.length == 0">
        <v-icon small>mdi-trash-can</v-icon>删除
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
      <BtnIcon icon="mdi-family-tree" toolTip="显示拓扑图" @click="openServerTopology = true"/>
      <BtnIcon icon="mdi-refresh" color="info" toolTip="刷新" @click="table.refresh()"/>
    </v-col>
    <v-col cols="4">
      <v-text-field small dense hide-details v-model="table.search" append-icon="mdi-magnify" label="搜索"
        single-line></v-text-field>
    </v-col>
    <v-col cols='12'>
      <v-data-table dense show-select show-expand single-expand :headers="table.headers" :items="table.items"
        :items-per-page="table.itemsPerPage" :search="table.search" v-model="table.selected">
        <template v-slot:[`item.name`]="{ item }">
          {{ item.name }}
          <v-btn @click="changeServerNameDialog.open(item)" x-small icon><v-icon>mdi-pencil-minus</v-icon></v-btn>
          <v-btn @click="loginVnc(item)" x-small icon><v-icon>mdi-console</v-icon></v-btn>
        </template>
        <template v-slot:[`item.status`]="{ item }">
          <span v-if="item.status.toUpperCase() == 'DELETED'"> {{ item.status }}</span>
          <template v-else-if="item['OS-EXT-STS:vm_state'] == 'building' || item['OS-EXT-STS:task_state']">
            <v-icon color="warning" class="mdi-spin">mdi-rotate-right</v-icon>
          </template>
          <v-icon v-else-if="item['OS-EXT-STS:vm_state'] == 'active'" color="success">mdi-play-circle</v-icon>
          <v-icon v-else-if="item['OS-EXT-STS:vm_state'] == 'stopped'" color="warning">mdi-stop-circle</v-icon>
          <v-icon v-else-if="item['OS-EXT-STS:vm_state'] == 'paused'" color="warning">mdi-pause-circle</v-icon>
          <v-tooltip top v-else-if="item['OS-EXT-STS:vm_state'] == 'error'">
            <template v-slot:activator="{ on, attrs }">
              <v-icon color="error">mdi-alpha-x-circle</v-icon>
              <v-icon small v-bind="attrs" v-on="on">mdi-lightbulb-question</v-icon>
            </template>
            {{ table.getErrorMesage(item) }}
          </v-tooltip>
          {{ item['OS-EXT-STS:task_state'] }}
        </template>
        <template v-slot:[`item.power_state`]="{ item }">
          <v-icon v-if="item['OS-EXT-STS:power_state'] == 1" color="success">mdi-power-on</v-icon>
          <v-icon v-else-if="item['OS-EXT-STS:power_state'] == 3" color="warning">mdi-pause</v-icon>
          <v-icon v-else-if="item['OS-EXT-STS:power_state'] == 4" color="error">mdi-power-off</v-icon>
          <v-icon v-else-if="item['OS-EXT-STS:power_state'] != 0" color="warning" class="mdi-spin">mdi-loading</v-icon>
        </template>
        <template v-slot:[`item.addresses`]="{ item }">
          <v-chip label x-small v-for="(addresses, j) in table.parseAddresses(item)" class="mr-1 mb-1" v-bind:key="j">
            {{ addresses.join(' | ') }}
          </v-chip>
        </template>
        <template v-slot:[`item.flavor`]="{ item }"><span class="cyan--text">{{ item.flavor.original_name ||
          item.flavor.original_name }}</span></template>
        <template v-slot:[`item.image`]="{ item }">
          <span class="blue--text">{{ table.getImage(item).name }}</span>
          <v-icon small v-if="table.getRootBdm(item)">mdi-cloud</v-icon>
        </template>
        <template v-slot:[`item.action`]="{ item }">
          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon color="purple" v-bind="attrs" v-on="on"><v-icon small>mdi-dots-vertical</v-icon></v-btn>
            </template>
            <v-list dense>
              <v-list-item
                @click="computing.serverActions.open(item)"><v-list-item-title>操作记录</v-list-item-title></v-list-item>
              <v-list-item
                @click="computing.serverConsoleLog.open(item)"><v-list-item-title>控制台日志</v-list-item-title></v-list-item>
              <v-list-item
                @click="changePasswordDialog.open(item)"><v-list-item-title>修改密码</v-list-item-title></v-list-item>
              <v-list-item @click="serverVolumeDialog.open(item)"><v-list-item-title>卷管理</v-list-item-title></v-list-item>
              <v-list-item
                @click="serverInterfaceDialog.open(item)"><v-list-item-title>网卡管理</v-list-item-title></v-list-item>
              <v-list-item small
                @click="computing.updateServerSG.open(item)"><v-list-item-title>更新安全组</v-list-item-title></v-list-item>
              <v-list-item small @click="resizeDialog.open(item)"><v-list-item-title><span
                    class="orange--text">规格变更</span></v-list-item-title></v-list-item>
              <v-list-item small @click="rebuildDialog.open(item)"><v-list-item-title><span
                    class="orange--text">重建</span></v-list-item-title></v-list-item>
            </v-list>
          </v-menu>
        </template>

        <template v-slot:expanded-item="{ headers, item }">
          <td></td>
          <td :colspan="headers.length - 1">
            <table>
              <tr>
                <td><strong>UUID</strong></td>
                <td>{{ item.id }}</td>
              </tr>
              <tr>
                <td><strong>实例名</strong> </td>
                <td>{{ item['OS-EXT-SRV-ATTR:instance_name'] }}</td>
              </tr>
              <tr>
                <td><strong>创建时间</strong> </td>
                <td>{{ item.created }}</td>
              </tr>
              <tr>
                <td><strong>更新时间</strong> </td>
                <td>{{ item.updated }}</td>
              </tr>
              <tr>
                <td><strong>规格</strong></td>
                <td>{{ item.flavor }}</td>
              </tr>
              <tr>
                <td><strong>用户</strong> </td>
                <td>{{ item['user_id'] }}</td>
              </tr>
              <tr>
                <td><strong>租户</strong> </td>
                <td>{{ item['tenant_id'] }}</td>
              </tr>
              <tr>
                <td><strong>diskConfig</strong> </td>
                <td>{{ item['OS-DCF:diskConfig'] }}</td>
              </tr>
            </table>
          </td>
        </template>
      </v-data-table>
    </v-col>
    <NewServerDialog :show.sync="openNewServer" />
    <ServerTopology :show.sync="openServerTopology" />
  </v-row>
</template>

<script>
import i18n from '@/assets/app/i18n';
import { ServerDataTable } from '@/assets/app/tables.js';

import BtnIcon from '@/components/plugins/BtnIcon'
import NewServerDialog from './dialogs/NewServerDialog';
import ServerTopology from './dialogs/ServerTopology.vue';

export default {
  props: {
    show: Boolean,
  },
  components: {
    BtnIcon, NewServerDialog, ServerTopology
  },

  data: () => ({
    i18n: i18n,
    deleted: false,
    table: new ServerDataTable(),
    openNewServer: false,
    openServerTopology: false,
  }),
  methods: {
    refreshTable: function() {
      this.table.refresh();
    }
  },
  created() {
    this.table.refresh();
  }
};
</script>