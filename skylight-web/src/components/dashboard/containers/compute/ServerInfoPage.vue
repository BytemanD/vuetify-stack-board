<template>
  <v-row>
    <v-col cols="6" class="pb-0">
      <v-breadcrumbs class="pl-0" :items="breadcrumbItems" color="info" density="compact"></v-breadcrumbs>
    </v-col>
    <v-col cols="6">
      <v-btn class="ml-1" size="small" variant="outlined" color="info" @click="refreshServer()">刷新</v-btn>
    </v-col>
    <v-col cols="12">
      <v-tabs v-model="tabIndex" show-arrows density="compact" selected-class="bg-blue-grey-lighten-1" slider-color="blue-grey-lighten-1" >
        <v-tab>详情</v-tab>
        <v-tab>网卡</v-tab>
        <v-tab>云盘</v-tab>
        <v-tab>控制台日志</v-tab>
        <v-tab>操作记录</v-tab>
      </v-tabs>
      <div class="bg-blue-grey-lighten-1" style="height: 2px;"></div>
      <v-window v-model="tabIndex">
        <v-window-item>
          <v-row>
            <v-col cols="12" md="12" lg="6">
              <v-table density="compact" class="text-left">
                <tr>
                  <th>ID</th>
                  <td>
                    {{ server.id }}
                    <v-btn variant="text" color="info" @click="loginVnc()">远程登录</v-btn>
                  </td>
                </tr>
                <tr>
                  <th>名字</th>
                  <td>{{ server.name }}<v-btn variant="text" color="warning">重命名</v-btn></td>
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
                  <td>{{ server['OS-EXT-SRV-ATTR:host'] }}
                    <!-- <v-btn variant="text" color="warning">迁移</v-btn>
                      <v-btn variant="text" color="warning">热迁移</v-btn> -->
                    <btn-server-migrate :servers="[server]" @updateServer="updateServer" />
                    <v-btn variant="text" color="warning">疏散</v-btn>
                  </td>
                </tr>
                <tr>
                  <th>创建时间</th>
                  <td>{{ server.created }}</td>
                </tr>
                <tr>
                  <th>更新时间</th>
                  <td>{{ server.updated }}</td>
                </tr>
              </v-table>
            </v-col>
            <v-col cols="12" md="12" lg="6">
              <v-table density="compact" class="text-left">
                <tr>
                  <th>实例状态</th>
                  <td style="min-width: 120px">
                    <span v-if="server.status == 'ERROR'" class="text-red">{{ server.status }}</span>
                    <span v-else>{{ server.status }}</span>
                  </td>
                  <td>
                    <btn-server-reset-state :servers="[server]" @update-server="updateServer" />
                  </td>
                </tr>
                <tr>
                  <th>电源状态</th>
                  <td>
                    <v-icon size='small' v-if="server['OS-EXT-STS:power_state'] == 1"
                      color="success">mdi-power-on</v-icon>
                    <v-icon size='small' v-else-if="server['OS-EXT-STS:power_state'] == 3"
                      color="warning">mdi-pause</v-icon>
                    <v-icon size='small' v-else-if="server['OS-EXT-STS:power_state'] == 4"
                      color="red">mdi-power-off</v-icon>
                    <span v-else>UNKOWN</span>
                  </td>
                  <td>
                    <btn-server-reboot :servers="[server]" @updateServer="updateServer" />
                    <v-btn variant="text" color="warning" v-if="this.server.status == 'ACTIVE'" @click="stop()">
                      {{ $t('stop') }}</v-btn>
                    <v-btn variant="text" color="success" v-if="this.server.status == 'SHUTOFF'" @click="start()">
                      {{ $t('start') }}</v-btn>

                    <v-btn variant="text" color="warning" v-if="this.server.status == 'ACTIVE'" @click="pause()">
                      {{ $t('pause') }}</v-btn>
                    <v-btn variant="text" color="success" v-if="this.server.status == 'PAUSED'" @click="unpause()">
                      {{ $t('unpause') }}</v-btn>
                  </td>
                </tr>
                <tr>
                  <th>
                    任务状态
                  </th>
                  <td colspan="2">
                    <v-chip density="compact" variant="text" label color="warning"
                      v-if="server['OS-EXT-STS:task_state'] && server['OS-EXT-STS:task_state']">
                      {{ server['OS-EXT-STS:task_state'] && $t(server['OS-EXT-STS:task_state']) }}
                      <template v-slot:append>
                        <v-icon class="mdi-spin" small>mdi-loading</v-icon>
                      </template>
                    </v-chip>
                  </td>
                </tr>
              </v-table>
            </v-col>
            <v-divider></v-divider>
            <v-col cols="12" md="12" lg="6">
              <v-table density="compact" class="text-left">
                <tr>
                  <th style="min-width: 100px;">规格</th>
                  <td>
                    {{ server.flavor && server.flavor.original_name }}
                    <v-btn variant="text" color="warning">变更</v-btn>
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
                    <v-chip label density="compact" class="mr-1" v-for="(value, key) in server.flavor.extra_specs"
                      v-bind:key="key">
                      {{ key }}={{ value }}</v-chip>
                  </td>
                </tr>
              </v-table>
            </v-col>
            <v-col cols="12" md="12" lg="6">
              <v-table density="compact" class="text-left">
                <tr>
                  <th>镜像ID</th>
                  <td>
                    {{ server.image && server.image.id }}
                    <!-- <v-btn variant="text" color="warning">重装</v-btn> -->
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
              </v-table>
            </v-col>
          </v-row>
        </v-window-item>
        <v-window-item>
          <v-alert v-if="!interfaces || interfaces.length == 0" color="warning" density="compact" variant="text"
            class="mb-6" icon="mdi-alert">无网卡</v-alert>
          <v-row>
            <v-col cols="12" md='6' lg="4" class="pa-4" v-for="item in interfaces" :key="item.mac_addr">
              <server-interface-card :server-id="server.id" :vif="item" @detached="interfaceDetached" />
            </v-col>
          </v-row>
          <btn-attach-interfaces :server-id="server.id" @attaching-port="handleAttachingPortEvent"
            @attached-port="handleAttachedPortEvent" @attaching-net="handleAttachingNetEvent"
            @attached-net="handleAttachedNetEvent" />
        </v-window-item>
        <v-window-item>
          <v-alert v-if="!volumes || volumes.length == 0" color="warning" density="compact" variant="text" class="mb-6"
            icon="mdi-alert">无云盘</v-alert>
          <v-row>
            <v-col cols="12" md='6' lg="4" class="pa-4" v-for="item in volumes" :key="item.device">
              <server-volume-card :server-id="server.id" :volume="item"
                :root-device-name="server['OS-EXT-SRV-ATTR:root_device_name']"
                @detached="handleAttachedVolume" />
            </v-col>
          </v-row>
          <btn-attach-volumes :server-id="server.id" @attaching-volume="handleAttachingVolumeEvent"
            @attached-volume="handleAttachedVolumeEvent"/>
        </v-window-item>
        <v-window-item>
          <card-server-console-log :server-id="server.id" />
        </v-window-item>
        <v-window-item>
          <v-card>
            <v-card-title>操作记录</v-card-title>
          </v-card>
        </v-window-item>
        <v-window-item>
        </v-window-item>
      </v-window>
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

import BtnServerReboot from '@/components/plugins/BtnServerReboot.vue';
import BtnServerMigrate from '@/components/plugins/BtnServerMigrate.vue';

import { ServerTaskWaiter } from '@/assets/app/tables.jsx';

import ServerTopology from './dialogs/ServerTopology.vue';

import ServerInterfaceCard from '../../../plugins/ServerInterfaceCard.vue';
import ServerVolumeCard from '@/components/plugins/ServerVolumeCard.vue';
import BtnServerResetState from '@/components/plugins/button/BtnServerResetState.vue';
import BtnServerRebuild from '@/components/plugins/button/BtnServerRebuild.vue';

import ChangeServerNameDialog from './dialogs/ChangeServerNameDialog.vue';
import ServerActionDialog from './dialogs/ServerActionDialog.vue';
import ServerMigrateDialog from './dialogs/ServerMigrateDialog.vue';
import ServerResetStateDialog from './dialogs/ServerResetStateDialog.vue';
import ServerConsoleLogDialog from './dialogs/ServerConsoleLogDialog.vue';
import ServerChangePassword from './dialogs/ServerChangePassword.vue';
import ServerVolumes from './dialogs/ServerVolumes.vue';
import BtnAttachInterfaces from '@/components/plugins/button/BtnAttachInterfaces.vue';
import BtnAttachVolumes from '@/components/plugins/button/BtnAttachVolumes.vue';
import CardServerConsoleLog from '@/components/plugins/CardServerConsoleLog.vue';

import ServerUpdateSG from './dialogs/ServerUpdateSG.vue';
import ServerResize from './dialogs/ServerResize.vue';
import ServerRebuild from './dialogs/ServerRebuild.vue';
import ServerEvacuateDialog from './dialogs/ServerEvacuateDialog.vue';
import ServerGroupDialog from './dialogs/ServerGroupDialog.vue';

export default {
  components: {
    BtnIcon, ServerTopology, ServerInterfaceCard, ServerVolumeCard,
    BtnServerReboot, BtnServerMigrate,
    BtnServerResetState, BtnServerRebuild,
    ServerMigrateDialog, ServerEvacuateDialog, ServerResetStateDialog,
    ChangeServerNameDialog,
    ServerActionDialog,
    ServerConsoleLogDialog,
    ServerChangePassword,
    ServerVolumes, BtnAttachInterfaces, BtnAttachVolumes,
    CardServerConsoleLog,
    ServerUpdateSG, ServerResize, ServerRebuild,
    ServerGroupDialog,
  },

  data: () => ({
    Utils: Utils,
    i18n: i18n,
    serveId: "",
    selectedServer: {},
    openServerTopology: false,

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
    showServerGroupDialog: false,

    breadcrumbItems: [
      {
        title: '实例',
        href: '#/dashboard/server',
      },
    ],
    tabIndex: 0,
    server: {},
    image: {},
    interfaces: [],
    volumes: [],
  }),
  methods: {
    loginVnc: async function () {
      let body = await API.server.getVncConsole(this.serverId);
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
    },
    refreshServer: async function () {
      this.server = await API.server.show(this.serverId);
      this.breadcrumbItems[this.breadcrumbItems.length - 1] = this.server.name;
      this.refreshInterfaces();
      this.refreshVolumes();
    },
    refreshImage: async function () {
      if (this.image && this.image.id == this.server.image.id) {
        return
      }
      this.image = await API.image.show(this.server.image.id)
    },
    refreshInterfaces: async function () {
      this.interfaces = (await API.server.interfaceList(this.serverId)).interfaceAttachments
    },
    refreshVolumes: async function () {
      this.volumes = (await API.server.volumeAttachments(this.serverId)).volumeAttachments
    },
    refresh: async function () {
      await this.refreshServer()
      if (this.server.image && this.server.image.id) {
        await this.refreshImage()
      }
      this.refreshInterfaces()
      this.refreshVolumes();
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
  },
  created() {
    this.serverId = this.$route.params.id
    this.breadcrumbItems.push({ title: this.serverId })
    this.refresh()
  }
};
</script>