<template>
  <v-row>
    <!-- <v-col cols="12" lg="12">
    </v-col> -->
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
            <v-col cols="6">
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
                  <td><v-chip color="info" variant="text">{{ server.root_bdm_type }}</v-chip></td>
                </tr>
                <tr>
                  <th>节点</th>
                  <td>{{ server['OS-EXT-SRV-ATTR:host'] }}
                    <v-btn variant="text" color="warning">迁移</v-btn>
                    <v-btn variant="text" color="warning">热迁移</v-btn>
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
            <v-col cols="6">
              <v-table density="compact" class="text-left">
                <tr>
                  <th>实例状态</th>
                  <td>{{ server.status }}</td>
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
                    <v-icon size='small' v-else-if="server['OS-EXT-STS:power_state'] != 0" color="warning"
                      class="mdi-spin">mdi-loading</v-icon>
                    <v-btn variant="text" color="warning">关机</v-btn>
                    <v-btn variant="text" color="warning">重启</v-btn>
                    <v-btn variant="text" color="warning">暂停</v-btn>
                  </td>
                </tr>
                <tr>
                  <th>
                    任务状态 <v-btn density="compact" variant="text" icon="mdi-refresh" @click="refreshServer()"></v-btn>
                  </th>
                  <td>
                    <v-chip v-if="server['OS-EXT-STS:task_state'] && server['OS-EXT-STS:task_state'] != ''">
                      {{ $t(server['OS-EXT-STS:task_state']) }}
                    </v-chip>
                  </td>
                </tr>
              </v-table>
            </v-col>
            <v-divider></v-divider>
            <v-col cols="6">
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
            <v-col cols="6">
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
            <v-col cols="5" v-for="item in interfaces" :key="item.mac_addr" class="ma-1">
              <v-card>
                <v-card-title>MAC地址: {{ item.mac_addr }}</v-card-title>
                <v-card-text>
                  <v-table density="compact" class="text-left">
                    <tr>
                      <td>ID</td>
                      <td>{{ item.port_id }}</td>
                    </tr>
                    <tr>
                      <td>状态</td>
                      <td>{{ item.port_state }}</td>
                    </tr>
                    <tr>
                      <td>IP地址</td>
                      <td>
                        <v-chip size="small" label v-for="fixedIp in item.fixed_ips" :key="fixedIp.ip_address">
                          {{ fixedIp.ip_address }}
                        </v-chip>
                      </td>
                    </tr>
                  </v-table>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn variant="text" color="warning">卸载</v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>
        <v-window-item>
          <v-row>
            <v-col cols="5" v-for="item in volumes" :key="item.device">
              <v-card class="ma-1">
                <v-card-title>挂载路径: {{ item.device }}</v-card-title>
                <v-card-text>
                  <v-table density="compact">
                      <tr>
                        <td>挂载ID</td>
                        <td>{{ item.id }}</td>
                      </tr>
                      <tr>
                        <td>卷ID</td>
                        <td>{{ item.volumeId }}</td>
                      </tr>
                  </v-table>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn v-if="item.device != server['OS-EXT-SRV-ATTR:root_device_name']"
                    color="warning">卸载</v-btn>
                </v-card-actions>
              </v-card>
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

import { ServerDataTable } from '@/assets/app/tables.jsx';

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
  components: {
    BtnIcon, ServerTopology,
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
    table: new ServerDataTable(),
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
      API.server.list().then((servers) => {
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
    }
  },
  created() {
    this.serverId = this.$route.params.id
    this.breadcrumbItems.push({ title: this.serverId, href: "sdf" })
    this.refresh()
  }
};
</script>