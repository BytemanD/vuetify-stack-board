<template>
  <v-app>
    <v-app-bar app dense>
      <v-app-bar-nav-icon @click="navigation.mini = !navigation.mini"></v-app-bar-nav-icon>
      <v-toolbar-title style="width: 20%">
        <v-select solo-inverted flat hide-details :prefix='"cluster" + ":"' item-text="name" class="rounded-0"
          append-icon="mdi-map" v-model="clusterTable.selected" :items="clusterTable.items">
        </v-select>
      </v-toolbar-title>
      <v-toolbar-title class="ml-1" style="width: 20%">
        <v-select solo-inverted flat hide-details clearable :prefix='"region" + ":"' class="rounded-0"
          append-icon="mdi-map-marker" v-model="context.region" item-text="id" item-name="id">
        </v-select>
      </v-toolbar-title>

      <v-spacer></v-spacer>
      <BtnTheme />
      <BtnHome />
      <v-btn icon><v-icon>mdi-cog</v-icon></v-btn>
    </v-app-bar>

    <v-navigation-drawer app :mini-variant="navigation.mini" :expand-on-hover="navigation.mini">
      <v-list-item two-line class="px-2">
        <v-list-item-avatar class="ml-0" tile><img src="../../../public/favicon.svg"></v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>{{ name }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list shaped dense>
        <v-list-item-group v-model="navigation.itemIndex" color="primary">
          <template v-for="group in navigation.group">
            <template>
              <v-subheader v-bind:key="group.name">
                <h3 class="primary--text">{{ group.name }}</h3><v-divider></v-divider>
              </v-subheader>
              <v-list-item v-for="item in group.items" v-bind:key="item.router"
                :disabled="navigation.selectedItem.router == item.router"
                v-bind:class="{ 'v-list-item--active': navigation.selectedItem.router == item.router }"
                @click="selectItem(item)">
                <v-list-item-icon><v-icon>{{ item.icon }}</v-icon></v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>{{ item.title }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </template>
          </template>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { ClusterTable } from '@/assets/app/tables';
import { SETTINGS } from '@/assets/app/settings';

import BtnTheme from '../plugins/BtnTheme.vue';
import BtnHome from '../plugins/BtnHome.vue';

const navigationGroup = [
  {
    name: '概览',
    items: [
      { title: '虚拟化资源', icon: 'mdi-alpha-h-circle', router: '/hypervisor' },
    ]
  },
  {
    name: '计算',
    items: [
      { title: '实例', icon: 'mdi-laptop-account', router: '/server' },
      { title: '计算管理', icon: 'mdi-layers', router: '/compute' },
      { title: '存储', icon: 'mdi-expansion-card', router: '/storage' },
      { title: '镜像', icon: 'mdi-package-variant-closed', router: '/image' },
    ],
  },
  {
    name: '网络',
    items: [
      { title: '网络资源', icon: 'mdi-web', router: '/networking' },
    ]
  },
  {
    name: '认证',
    items: [
      { title: '服务地址', icon: 'mdi-server', router: '/endpoint' },
      { title: '项目', icon: 'mdi-account-supervisor', router: '/project' },
      { title: '域', icon: 'mdi-domain', router: '/domain' },

    ]
  }
]

export default {
  components: {
    BtnTheme, BtnHome
  },

  data: () => ({
    name: 'Forward',
    ui: {
      navigationWidth: '200px'
    },
    navigation: {
      group: navigationGroup,
      selectedItem: {},
      mini: false,
    },
    context: {
      clusterId: localStorage.getItem('clusterId'),
      region: null,
    },
    clusterTable: new ClusterTable(),
  }),
  methods: {
    selectItem(item) {
      localStorage.setItem('navigationSelectedItem', JSON.stringify(item));
      this.navigation.selectedItem = item;
      if (this.$route.path == '/' || this.$route.path != item.router) {
        this.$router.replace({ path: item.router });
      }
    },
    async refresh() {
      await this.clusterTable.refresh();
      for (let i in this.clusterTable.items) {
        if (parseInt(this.context.clusterId) != this.clusterTable.items[i].id) {
          continue
        }
        this.clusterTable.selected = this.clusterTable.items[i];
        break;
      }
      this.region = localStorage.getItem('region');
    },
  },
  created() {
    this.$vuetify.theme.dark = SETTINGS.getItem('themeDark').getValue();
    if (this.$route.path == '/') {
      let localItem = localStorage.getItem('navigationSelectedItem');
      if (localItem){
        this.selectItem(JSON.parse(localItem));
      } else {
        this.selectItem(navigationGroup[0].items[0]);
      }
    }
    this.clusterTable.selected = {};
    this.refresh();
  }
};
</script>
