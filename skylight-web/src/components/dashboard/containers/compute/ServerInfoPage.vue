<template>
  <v-row>
    <v-col cols="12">
      <v-breadcrumbs class="pl-0" :items="breadcrumbItems" color="info" density="compact"></v-breadcrumbs>
      <v-tabs v-model="tabIndex" selected-class="bg-white text-primary " bg-color="primary" density="compact">
        <v-tab>详情</v-tab>
        <v-tab>网卡</v-tab>
        <v-tab>云盘</v-tab>
        <v-tab>操作记录</v-tab>
      </v-tabs>
      <br>
      <v-window v-model="tabIndex">
        <v-window-item>
          <v-row>
            <v-col cols="12" md="12" lg="6">
              <v-table density="compact" class="text-left">
                <tr>
                  <th>实例ID</th>
                  <td>{{ server.id }}<v-btn variant="text" color="info" @click="loginVnc()">远程登录</v-btn></td>
                </tr>
                <tr>
                  <th>实例名</th>
                  <td>{{ server.name }}<v-btn variant="text" color="warning">重命名</v-btn></td>
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
                    {{ server.status }}
                    <!-- <v-btn variant="text" color="warning">重置状态</v-btn> -->
                  </td>
                  <td>
                    <v-btn variant="text" color="warning">重置状态</v-btn>
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
                    <v-btn variant="text" color="warning" :disabled="this.server.status != 'ACTIVE'" @click="stop()">
                      {{ $t('stop') }}</v-btn>
                    <v-btn variant="text" color="success" :disabled="this.server.status != 'SHUTOFF'" @click="start()">
                      {{ $t('start') }}</v-btn>
                    <btn-server-reboot :servers="[server]" @updateServer="updateServer" />
                    <v-btn variant="text" color="warning">暂停</v-btn>
                  </td>
                </tr>
                <tr>
                  <th>
                    任务状态
                    <v-btn density="compact" variant="text" icon="mdi-refresh" @click="refreshServer()"></v-btn>
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
                  <th>规格</th>
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
              </v-table>
            </v-col>
            <v-col cols="12" md="12" lg="6">
              <v-table density="compact" class="text-left">
                <tr>
                  <th>镜像ID</th>
                  <td>
                    {{ server.image && server.image.id }}
                    <v-btn variant="text" color="warning">重装</v-btn>
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
          <v-row>
            <v-col cols="12" md='6' lg="4" class="pa-4" v-for="item in interfaces" :key="item.mac_addr">
              <server-interface-card :server-id="server.id" :vif="item" />
            </v-col>
          </v-row>
        </v-window-item>
        <v-window-item>
          <v-row>
            <v-col cols="12" md='6' lg="4" class="pa-4" v-for="item in volumes" :key="item.device">
              <server-volume-card :server-id="server.id" :volume="item"
                :root-device-name="server['OS-EXT-SRV-ATTR:root_device_name']" />
            </v-col>
          </v-row>
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
    <!-- <v-table density="compact">
            <tbody>
              <tr>
                <td>属性</td>
                <td>
                  <template v-if="server.flavor">
                    <v-chip label variant="text" class="mt-1 ml-1" density="compact"
                      v-for="(v, k) in server.flavor.extra_specs" v-bind:key="k">
                      {{ k }}={{ v }}
                    </v-chip>
                  </template>
                </td>
              </tr>
            </tbody>
          </v-table> -->
  </v-row>
</template>

<script>
import i18n from '@/assets/app/i18n';
import BtnIcon from '@/components/plugins/BtnIcon'
import API from '@/assets/app/api';
import { Utils } from '@/assets/app/lib';

import BtnServerReboot from '@/components/plugins/BtnServerReboot.vue';
import BtnServerMigrate from '@/components/plugins/BtnServerMigrate.vue';

import { ServerTaskWaiter } from '@/assets/app/tables.jsx';

import ServerTopology from './dialogs/ServerTopology.vue';

import ServerInterfaceCard from '../../../plugins/ServerInterfaceCard.vue';
import ServerVolumeCard from '@/components/plugins/ServerVolumeCard.vue';

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
  components: {
    BtnIcon, ServerTopology, ServerInterfaceCard, ServerVolumeCard,
    BtnServerReboot, BtnServerMigrate,
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
    },
    refresh: async function () {
      await this.refreshServer()
      if (this.server.image && this.server.image.id) {
        this.image = await API.image.show(this.server.image.id)
      }
      this.interfaces = (await API.server.interfaceList(this.serverId)).interfaceAttachments
      this.volumes = (await API.server.volumeAttachments(this.serverId)).volumeAttachments
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
    updateServer: function (server) {
      console.debug('update server', server)
      for (var key in server) {
        if (this.server[key] == server[key]) {
          continue
        }
        this.server[key] = server[key]
      }
    }
  },
  created() {
    this.serverId = this.$route.params.id
    this.breadcrumbItems.push({ title: this.serverId })
    this.refresh()
  }
};
</script>