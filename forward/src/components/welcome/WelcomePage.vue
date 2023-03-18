<template>
  <v-app>
    <v-main class="indigo lighten-4">
      <v-row>
        <v-col cols="2"></v-col>
        <v-col cols="8">
          <v-card class="mx-auto mt-10 blue-grey lighten-4" elevation="4">
            <v-img class="white--text align-end" src="@/../public/welcome.svg">
              <v-card-title>
                欢迎使用 Forward
                <v-chip x-small color="warning" class="ml-4" v-if="newVersion && newVersion.version"><v-icon
                    x-small>mdi-star</v-icon>新版本：{{ newVersion.version }}</v-chip>
              </v-card-title>
              <v-card-subtitle>版本：{{ version }}</v-card-subtitle>
              <v-card-subtitle>Forward 是一个基于Vuetify实现的OpenStack管理服务。</v-card-subtitle>
            </v-img>
            <v-card-text class="text--primary">
              <v-alert class="blue-grey lighten-4" border="left" colored-border color="deep-purple accent-1"
                v-if="clusterTable.items.length == 0">
                <v-icon>mdi-information-outline</v-icon>当前集群数目为 {{ clusterTable.items.length }}，请添加新集群。
              </v-alert>
              <h4>常用集群</h4>
              <v-chip close label color="primary" class="mr-2 mt-2" v-bind:key="item.i" v-for="item in clusterTable.items"
                @click:close="deleteCluster(item)" @click="useCluster(item)">{{ item.name }}
              </v-chip>
            </v-card-text>
            <v-card-actions>
              <v-btn color="orange" text v-click="newCluster.display()"><v-icon>mdi-plus</v-icon> 添加集群</v-btn>
              <v-spacer></v-spacer>
              <v-btn icon href="https://github.com/fjboy/vuetify-stack-board"
                target="_new"><v-icon>mdi-github</v-icon></v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="2"></v-col>
      </v-row>
    </v-main>
  </v-app>
</template>
  
<script>
import axios from 'axios';
import { Notify } from 'vuetify-message-snackbar';

import API from '@/assets/app/api';
import { NewAggDialog } from '@/assets/app/dialogs';
import { ClusterTable } from '@/assets/app/tables';


export default {
  name: 'WelcomePage',
  components: {

  },

  data: () => ({
    api: API,
    version: null,
    newVersion: {},
    newCluster: new NewAggDialog(),
    clusterTable: new ClusterTable(),
  }),
  methods: {
    useCluster: function (cluster) {
      this.$cookies.set('clusterId', cluster.id);
      this.$cookies.set('clusterName', cluster.name);
      let headers = {
        'X-Cluster-Id': cluster.id,
      };
      console.log('headers', headers)
      axios.get('/identity', { headers: headers }).then(() => {
        localStorage.setItem('clusterId', cluster.id);
        window.open('/dashboard', '_self');
      }).catch(error => {
        console.error(error);
        Notify.error(`连接 ${cluster.name} 失败`)
      })
    },
    checkLastVersion: async function () {
      this.newVersion = await API.actions.checkLastVersion()
    },
    deleteCluster: async (item) => {
      await this.clusterTable.delete(item);
      Notify.success('删除成功');
      this.clusterTable.refresh();
    },
    getVersion: async function () {
      this.version = await (API.version.get());
    },
  },
  created() {
    this.clusterTable.refresh();
    this.getVersion();
  }
};
</script>
  