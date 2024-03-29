<template>
  <v-row>
    <v-col cols="12" md="12" lg="4" class="pb-0">
      <v-breadcrumbs class="pl-0" :items="breadcrumbItems" color="info" density="compact"></v-breadcrumbs>
    </v-col>
    <v-col cols="12" md="12" lg="8" class="pb-0">
      <v-toolbar density="compact" class="rounded">
        <btn-server-reset-state :servers="[server]" @update-server="updateServer" />
        <btn-server-reboot variant="text" :servers="[server]" @updateServer="updateServer" />
        <v-btn variant="text" color="warning" v-if="this.server.status == 'ACTIVE'" @click="stop()">
          {{ $t('stop') }}</v-btn>
        <v-btn variant="text" color="success" v-if="this.server.status == 'SHUTOFF'" @click="start()">
          {{ $t('start') }}</v-btn>
        <v-btn variant="text" color="warning" v-if="this.server.status == 'ACTIVE'" @click="pause()">
          {{ $t('pause') }}</v-btn>
        <v-btn variant="text" color="success" v-if="this.server.status == 'PAUSED'" @click="unpause()">
          {{ $t('unpause') }}</v-btn>
        <btn-server-migrate :servers="[server]" @updateServer="updateServer" />
        <btn-server-evacuate :servers="[server]" @updateServer="updateServer" />
        <btn-server-change-pwd v-if="server.name" :server="server" />
        <v-spacer></v-spacer>
        <v-btn class="ml-1" variant="text" color="info" @click="refresh()">刷新</v-btn>
      </v-toolbar>
    </v-col>
    <v-col cols="12">
      <tab-windows :tabs="tabs" @switch-tab="handleSwitchTab">
        <template v-slot:window-items>
          <v-window-item>
            <v-row>
              <v-col cols="12" md="12" lg="8">
                <table density="compact" class="text-left">
                  <tr>
                    <th style="min-width: 100px">ID</th>
                    <td>
                      {{ server.id }}
                      <v-btn variant="text" color="info" density="compact" @click="loginVnc()">远程登录</v-btn>
                    </td>
                  </tr>
                  <tr>
                    <th>名字</th>
                    <td>{{ server.name }}
                      <btn-server-rename v-if="server.name" size="small" :server="server" @update-server="updateServer" />
                    </td>
                  </tr>
                  <tr>
                    <th>实例名</th>
                    <td>{{ server['OS-EXT-SRV-ATTR:instance_name'] }}</td>
                  </tr>
                  <tr>
                    <th>描述</th>
                    <td>{{ server.description }}</td>
                  </tr>
                  <tr>
                    <th>系统盘类型</th>
                    <td><span class="text-info">{{ server.root_bdm_type }}</span></td>
                  </tr>
                  <tr>
                    <th>节点</th>
                    <td>{{ server['OS-EXT-SRV-ATTR:host'] }}</td>
                  </tr>
                  <tr>
                    <th>创建时间</th>
                    <td>{{ server.created }}</td>
                  </tr>
                  <tr>
                    <th>更新时间</th>
                    <td>{{ server.updated }}</td>
                  </tr>
                </table>
              </v-col>
              <v-col cols="12" md="12" lg="4">

                <table density="compact" class="text-left">
                  <tr>
                    <th style="min-width: 70px">实例状态</th>
                    <td>
                      <span v-if="server.status == 'ERROR'" class="text-red">{{ server.status }}</span>
                      <span v-else>{{ server.status }}</span>
                    </td>
                  </tr>
                  <tr>
                    <th>电源状态</th>
                    <td>
                      <v-icon size='small' v-if="server['OS-EXT-STS:power_state'] == 1" color="success">
                        mdi-power-on</v-icon>
                      <v-icon size='small' v-else-if="server['OS-EXT-STS:power_state'] == 3" color="warning">
                        mdi-pause</v-icon>
                      <v-icon size='small' v-else-if="server['OS-EXT-STS:power_state'] == 4" color="red">
                        mdi-power-off</v-icon>
                      <span v-else>UNKOWN</span>
                    </td>
                  </tr>
                  <tr>
                    <th>任务状态</th>
                    <td>
                      <v-chip density="compact" variant="text" label color="warning"
                        v-if="server['OS-EXT-STS:task_state'] && server['OS-EXT-STS:task_state']">
                        {{ server['OS-EXT-STS:task_state'] && $t(server['OS-EXT-STS:task_state']) }}
                        <template v-slot:append>
                          <v-icon class="mdi-spin" size="small">mdi-loading</v-icon>
                        </template>
                      </v-chip>
                      <dialog-live-migrate-abort v-if="server.status == 'MIGRATING'" :items="[server]" />
                    </td>
                  </tr>
                </table>
                <br>
                <v-progress-linear v-if="server.status == 'MIGRATING'" rounded height="12" color="green-lighten-2"
                  :model-value="server.progress">
                  <template v-slot:default="{ value }">{{ value }}%</template>
                </v-progress-linear>
              </v-col>
              <v-divider></v-divider>
              <v-col cols="12" md="12" lg="6">
                <table density="compact" class="text-left">
                  <tr>
                    <th style="min-width: 100px">规格</th>
                    <td>
                      {{ server.flavor && server.flavor.original_name }}
                      <!-- <v-btn variant="text" color="warning" density="compact" disabled>变更</v-btn> -->
                      <btn-server-resize :server="server" @update-server="updateServer" />
                    </td>
                  </tr>
                  <tr>
                    <!-- <td>{{ server.flavor && server.flavor.original_name }}</td> -->
                    <th>CPU & 内存</th>
                    <td>{{ server.flavor && server.flavor.vcpus || 0 }}核 {{ server.flavor && server.flavor.ram || 0 }} MB
                    </td>
                  </tr>
                  <tr>
                    <th>磁盘大小</th>
                    <td>{{ server.flavor && server.flavor.diskx || 0 }} GB</td>
                  </tr>
                  <tr v-if="server.flavor">
                    <th>属性</th>
                    <td>
                      <v-chip label density="compact" class="mr-1 mt-1" v-for="(value, key) in server.flavor.extra_specs"
                        v-bind:key="key">
                        {{ key }}={{ value }}</v-chip>
                    </td>
                  </tr>
                </table>
              </v-col>
              <v-col cols="12" md="12" lg="6">
                <table density="compact" class="text-left">
                  <tr>
                    <th style="min-width: 70px">镜像ID</th>
                    <td>
                      {{ server.image && server.image.id }}
                      <btn-server-rebuild :servers="[server]" @update-server="updateServer" />
                    </td>
                  </tr>
                  <tr>
                    <th>镜像名</th>
                    <td>{{ image.name }}</td>
                  </tr>
                  <tr>
                    <th>状态</th>
                    <td>{{ image.status }}</td>
                  </tr>
                  <tr>
                    <th>大小</th>
                    <td>{{ image.size }}</td>
                  </tr>
                  <tr v-if="image">
                    <th>属性</th>
                    <td>
                      <template v-for="(value, key) in image">
                        <v-chip label density="compact" class="mr-1 mt-1" v-if="key.startsWith('hw')" v-bind:key="key">
                          {{ key }}={{ value }}</v-chip>
                      </template>
                    </td>
                  </tr>
                </table>
              </v-col>
            </v-row>
          </v-window-item>
          <v-window-item>
            <v-chip color="info">总数： {{ interfaces.length }}</v-chip>
            <btn-attach-interfaces :server-id="server.id" @attaching-port="handleAttachingPortEvent"
              @attached-port="handleAttachedPortEvent" @attaching-net="handleAttachingNetEvent"
              @attached-net="handleAttachedNetEvent" />
            <v-alert v-if="!interfaces || interfaces.length == 0" color="warning" density="compact" variant="text"
              class="mb-6" icon="mdi-alert">无网卡</v-alert>
            <v-row>
              <v-col cols="12" md='6' lg="4" class="pa-4" v-for="item in interfaces" :key="item.mac_addr">
                <server-interface-card :server-id="server.id" :vif="item" @detached="interfaceDetached" />
              </v-col>
            </v-row>
          </v-window-item>
          <v-window-item>
            <v-chip color="info">总数： {{ volumes.length }}</v-chip>
            <btn-attach-volumes :server-id="server.id" @attaching-volume="handleAttachingVolumeEvent"
              @attached-volume="handleAttachedVolumeEvent" />
            <v-alert v-if="!volumes || volumes.length == 0" color="warning" density="compact" variant="text" class="mb-6"
              icon="mdi-alert">无云盘</v-alert>
            <v-row>
              <v-col cols="12" md='6' lg="4" class="pa-4" v-for="item in volumes" :key="item.device">
                <server-volume-card :server-id="server.id" :volume="item"
                  :root-device-name="server['OS-EXT-SRV-ATTR:root_device_name']" @detached="handleAttachedVolume" />
              </v-col>
            </v-row>
          </v-window-item>
          <v-window-item>
            <card-server-console-log :server-id="server.id" />
          </v-window-item>
          <v-window-item>
            <card-server-console :server-id="server.id" :console-url="consoleUrl" :console-error="consoleError" />
          </v-window-item>
          <v-window-item>
            <card-server-actions v-if="server" :server-id="server.id" :actions="serverActions" />
          </v-window-item>
          <v-window-item>
            <migration-table v-if="serverId" :table="migrationTable" />
          </v-window-item>
        </template>
      </tab-windows>
    </v-col>
    <v-notifications location="bottom right" :timeout="3000" />
  </v-row>
</template>

<script>
import i18n from '@/assets/app/i18n';
import BtnIcon from '@/components/plugins/BtnIcon'
import API from '@/assets/app/api';
import { Utils } from '@/assets/app/lib';
import notify from '@/assets/app/notify';


import { ServerTaskWaiter, MigrationDataTable } from '@/assets/app/tables.jsx';

import ServerTopology from './dialogs/ServerTopology.vue';

import ServerInterfaceCard from '../../../plugins/ServerInterfaceCard.vue';
import ServerVolumeCard from '@/components/plugins/ServerVolumeCard.vue';
import BtnServerResetState from '@/components/plugins/button/BtnServerResetState.vue';
import BtnServerRebuild from '@/components/plugins/button/BtnServerRebuild.vue';

import ChangeServerNameDialog from './dialogs/ChangeServerNameDialog.vue';
import ServerActionDialog from './dialogs/ServerActionDialog.vue';
import ServerResetStateDialog from './dialogs/ServerResetStateDialog.vue';
import ServerChangePassword from './dialogs/ServerChangePassword.vue';
import ServerVolumes from './dialogs/ServerVolumes.vue';
import BtnAttachInterfaces from '@/components/plugins/button/BtnAttachInterfaces.vue';
import BtnAttachVolumes from '@/components/plugins/button/BtnAttachVolumes.vue';

import CardServerConsoleLog from '@/components/plugins/CardServerConsoleLog.vue';
import CardServerConsole from '@/components/plugins/CardServerConsole.vue';
import CardServerActions from '@/components/plugins/CardServerActions.vue';
import TabWindows from '@/components/plugins/TabWindows.vue';
import MigrationTable from '@/components/plugins/tables/MigrationTable.vue';
import DialogLiveMigrateAbort from '@/components/plugins/dialogs/DialogLiveMigrateAbort.vue';

import ServerUpdateSG from './dialogs/ServerUpdateSG.vue';
import ServerRebuild from './dialogs/ServerRebuild.vue';
import ServerGroupDialog from './dialogs/ServerGroupDialog.vue';
import BtnServerReboot from '@/components/plugins/BtnServerReboot.vue';
import BtnServerMigrate from '@/components/plugins/BtnServerMigrate.vue';
import BtnServerRename from '@/components/plugins/BtnServerRename.vue';
import BtnServerChangePwd from '@/components/plugins/BtnServerChangePwd.vue';
import BtnServerResize from '@/components/plugins/BtnServerResize.vue';
import BtnServerEvacuate from '@/components/plugins/BtnServerEvacuate.vue';

export default {
  components: {
    BtnIcon, ServerTopology, ServerInterfaceCard, ServerVolumeCard,
    BtnServerReboot, BtnServerMigrate, BtnServerResetState, BtnServerRebuild,
    ServerResetStateDialog,
    ChangeServerNameDialog, ServerActionDialog,

    ServerChangePassword, ServerVolumes, BtnAttachInterfaces, BtnAttachVolumes,
    CardServerConsoleLog, CardServerConsole, CardServerActions, TabWindows, ServerUpdateSG,
    ServerRebuild, ServerGroupDialog, MigrationTable,
    DialogLiveMigrateAbort, BtnServerRename, BtnServerChangePwd, BtnServerResize,
    BtnServerEvacuate,
  },

  data: () => ({
    Utils: Utils,
    i18n: i18n,
    serverId: "",
    selectedServer: {},

    breadcrumbItems: [
      {
        title: '实例',
        href: '#/dashboard/server',
      },
    ],
    tabIndex: 0,
    tabs: ['详情', '网卡', '云盘', '终端日志', 'VNC', '操作记录', '迁移记录'],
    server: {},
    image: {},
    interfaces: [],
    volumes: [],
    serverActions: [],
    migrationTable: {},
    consoleUrl: '',
    consoleError: '',
  }),
  methods: {
    loginVnc: async function () {
      await this.refreshConsoleUrl()
      if (this.consoleUrl) {
        window.open(this.consoleUrl, '_blank');
      } else {
        notify.error(this.consoleError)
      }
    },
    refreshConsoleUrl: async function () {
      try {
        let body = await API.server.getVncConsole(this.serverId);
        this.consoleUrl = body.remote_console.url;
      } catch (e) {
        if (e.response && e.response.data) {
          this.consoleError = `无法获取VNC链接: ${JSON.stringify(e.response.data)}`
        } else {
          this.consoleError = `无法获取VNC链接: ${e}`
        }
      }
    },
    refreshServer: async function () {
      this.server = await API.server.show(this.serverId);
      this.breadcrumbItems[this.breadcrumbItems.length - 1] = this.server.name;
    },
    refreshImage: async function () {
      if (this.image && this.image.id == this.server.image.id) {
        return
      }
      this.image = await API.image.show(this.server.image.id)
    },
    refreshInterfaces: async function () {
      this.interfaces = await API.server.interfaceList(this.serverId)
    },
    refreshVolumes: async function () {
      this.volumes = await API.server.volumeAttachments(this.serverId)
    },
    refreshActions: async function () {
      this.serverActions = (await API.server.actionList(this.serverId)).reverse();
    },
    refreshMigrations: async function () {
      this.migrationTable.refresh();
    },
    refresh: async function () {
      await this.refreshServer()
      if (this.server.image && this.server.image.id) {
        await this.refreshImage()
      }
      this.refreshWindownItem()
    },
    refreshWindownItem: function () {
      switch (this.tabs[this.tabIndex]) {
        case '网卡':
          this.refreshInterfaces();
          break;
        case '云盘':
          this.refreshVolumes();
          break;
        case '操作记录':
          this.refreshActions();
          break;
        case '迁移记录':
          this.refreshMigrations();
          break;
        case 'VNC':
          this.refreshConsoleUrl()
          break;
      }
    },
    stop: async function () {
      // TODO: use BtnServerStop
      if (!this.server.id) { return }
      await API.server.stop(this.serverId)
      let waiter = new ServerTaskWaiter(this.server)
      waiter.waitStopped()
    },
    start: async function () {
      if (!this.server.id) { return }
      await API.server.start(this.serverId)
      let waiter = new ServerTaskWaiter(this.server)
      waiter.waitStarted()
    },
    hardReboot: async function () {
      if (!this.server.id) {
        return
      }
      await API.server.hardReboot(this.serverId)
      let waiter = new ServerTaskWaiter(this.server)
      waiter.waitStarted()
    },
    pause: async function () {
      // TODO: use BtnServerStop
      if (!this.server.id) { return }
      await API.server.pause(this.serverId)
      let waiter = new ServerTaskWaiter(this.server)
      waiter.waitPaused()
    },
    unpause: async function () {
      if (!this.server.id) { return }
      await API.server.unpause(this.serverId)
      let waiter = new ServerTaskWaiter(this.server)
      waiter.waitStarted()
    },
    updateServer: function (server) {
      for (var key in server) {
        if (this.server[key] == server[key]) {
          continue
        }
        this.server[key] = server[key]
      }
      if (this.server.image.id != this.image.id) {
        this.refreshImage()
      }
    },
    interfaceDetached: function (portId) {
      for (let i in this.interfaces) {
        if (this.interfaces[i].port_id == portId) {
          this.interfaces.splice(i, 1)
          break;
        }
      }
    },
    handleAttachingPortEvent: function (data) {
      notify.info(`网卡 ${data} 挂载中 ...`);
    },
    handleAttachedPortEvent: function (data) {
      this.refreshInterfaces();
    },
    handleAttachingNetEvent: function (data) {
      notify.info(`网络 ${data} 添加中...`);
    },
    handleAttachedNetEvent: function (data) {
      this.refreshInterfaces();
    },
    handleAttachedVolume: function (data) {
      for (let i in this.volumes) {
        if (this.volumes[i].volumeId == data) {
          this.volumes.splice(i, 1)
          break;
        }
      }
    },
    handleAttachingVolumeEvent: function (data) {
      notify.info(`卷 ${data} 挂载中 ...`);
    },
    handleAttachedVolumeEvent: function (data) {
      this.refreshVolumes();
    },
    handleSwitchTab: function (index) {
      this.tabIndex = index
      this.refreshWindownItem()
    }
  },
  created() {
    this.serverId = this.$route.params.id
    this.migrationTable = new MigrationDataTable(this.serverId);
    this.breadcrumbItems.push({ title: this.serverId })
    this.refresh()
  }
};
</script>