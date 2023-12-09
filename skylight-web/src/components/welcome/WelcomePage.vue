<template>
  <v-app>
    <v-main class="bg-indigo-lighten-4">
      <v-row text-center>
        <v-col cols="6" class="mx-auto">
          <v-card class="mx-auto mt-6 bg-blue-grey-lighten-4" elevation="4">
            <v-img class="text-white align-end" src="@/assets/welcome.svg">
              <v-card-title>欢迎使用 Skylight</v-card-title>
              <v-card-text>
                Skylight 是一个基于Vuetify实现的OpenStack管理服务。
                <v-btn variant="text" icon="mdi-github" href="https://github.com/BytemanD/vuetify-stack-board"
                  target="_new">
                </v-btn>
                <br>
                <v-chip>{{ version }}</v-chip>
                <v-chip variant="text" prepend-icon="mdi-star" size="small" color="warning" class="ml-4"
                  v-if="newVersion && newVersion.version">
                  新版本：{{ newVersion.version }}
                </v-chip>
              </v-card-text>
            </v-img>
            <v-card-text>
              <strong>集群</strong>
              <v-btn color="grey" variant="text" density="compact" class="ml-4" @click="refresh()" icon="mdi-refresh"></v-btn>
              <br>
              <v-alert density='compact' type="warning" variant="text" v-if="noCluster" text="请添加新集群"></v-alert>
              <v-chip close closable label color="primary" class="mr-1 mt-1" v-bind:key="item.i"
              v-for="item in table.items" @click:close="deleteCluster(item)" @click="useCluster(item)">{{ item.name }}
            </v-chip>
            <NewClusterVue @completed="refresh()"/>
            </v-card-text>
            <v-progress-linear indeterminate color="purple-darken-2" v-if="refreshing"></v-progress-linear>
          </v-card>
        </v-col>
      </v-row>
      <v-notifications location="bottom center" :timeout="3000" />
    </v-main>
  </v-app>
</template>

<script>
import Init from '@/assets/app/init';

import API from '@/assets/app/api';
import { ClusterTable } from '@/assets/app/tables';
import NewClusterVue from './NewCluster.vue';
import notify from '@/assets/app/notify';

export default {
  components: { NewClusterVue },
  data: () => ({
    api: API,
    version: "",
    newVersion: {},
    table: new ClusterTable(),
    openNewClusterDialog: false,
    refreshing: false,
    noCluster: true,
  }),
  methods: {
    useCluster: async function (cluster) {
      try {
        await API.idengity.index(cluster.id)
        localStorage.setItem('clusterId', cluster.id);
        this.$router.push('/dashboard')
      } catch (e) {
        console.error(e);
        notify.error(`"${cluster.name}" 连接失败`)
      }
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
    if (!localStorage.getItem('X-Token')) {
      notify.error('请重新登录')
      this.$router.push('/login')
      return
    }
    this.getVersion();
    this.refresh();
  }
}

</script>
