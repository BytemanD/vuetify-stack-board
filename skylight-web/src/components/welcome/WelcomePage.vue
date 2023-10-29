<template>
  <v-app>
    <v-main class="bg-indigo-lighten-4">
      <v-row text-center>
        <v-col cols="6" class="mx-auto">
          <v-card class="mx-auto mt-6 bg-blue-grey-lighten-4" elevation="4">
            <v-img class="text-white align-end" src="/welcome.svg">
              <v-card-title>欢迎使用 SkyLight</v-card-title>
              <v-card-text>SkyLight 是一个基于Vuetify实现的OpenStack管理服务。</v-card-text>
            </v-img>
            <v-card-subtitle class="pt-4">版本: {{ version }}
              <v-chip label size="small" color="green-darken-4" class="ma-4" v-if="newVersion && newVersion.version">
                <v-icon>mdi-star</v-icon>新版本：{{ newVersion.version }}
              </v-chip>
            </v-card-subtitle>
            <v-card-text class="text--primary">
              <h3 class="mb-2">常用集群</h3>
              <v-icon v-if="refreshing" class="mdi-spin" small>mdi-rotate-right</v-icon>
              <v-alert density='compact' type="warning" variant="text" v-if="noCluster" text="请添加新集群"></v-alert>
              <v-chip close closable label color="primary" class="mr-1 mt-1" v-bind:key="item.i" v-for="item in table.items"
                    @click:close="deleteCluster(item)" @click="useCluster(item)">{{ item.name }}
            </v-chip>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <NewClusterVue @completed="refresh()" />
              <v-btn variant="text" color="primary" @click="refresh()">刷新</v-btn>
              <v-spacer></v-spacer>
              <v-btn icon href="https://github.com/BytemanD/vuetify-stack-board"
                target="_new"><v-icon>mdi-github</v-icon></v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-main>
  </v-app>
</template>

<script>
import axios from 'axios';
// import { MESSAGE } from '@/assets/app/lib';
import Init from '@/assets/app/init';

import API from '@/assets/app/api';
import { ClusterTable } from '@/assets/app/tables';
import NewClusterVue from './NewCluster.vue';

export default {
  components: { NewClusterVue },
  data: () => ({
    api: API,
    version: "",
    newVersion: {},
    table: new ClusterTable(),
    openNewClusterDialog: false,
    refreshing: false,
    noCluster: false,
  }),
  methods: {
    useCluster: function (cluster) {
      this.$cookies.set('clusterId', cluster.id);
      this.$cookies.set('clusterName', cluster.name);
      let headers = {
        'X-Cluster-Id': cluster.id,
      };
      axios.get('/identity', { headers: headers }).then(() => {
        localStorage.setItem('clusterId', cluster.id);
        this.$router.push('/dashboard')
        // window.open('/dashboard', '_self');
      }).catch(error => {
        console.error(error);
        MESSAGE.error(`连接 ${cluster.name} 失败`)
      })
    },
    checkLastVersion: async function () {
      this.newVersion = await API.actions.checkLastVersion()
    },
    deleteCluster: async function (item) {
      await this.table.delete(item);
      this.table.refresh();
    },
    getVersion: async function () {
      this.version = await (API.version.get());
    },
    refresh: async function () {
      this.refreshing = true;
      await this.table.refresh();
      if (this.table.items.length == 0) {
        this.noCluster = true;
      } else {
        this.noCluster = false;
      }
      this.refreshing = false;
    }
  },
  created() {
    Init()
    this.getVersion();
    this.refresh();
  }
}

</script>
