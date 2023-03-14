<template>
  <v-app>
    <v-app-bar app dense>
      <v-app-bar-nav-icon @click="navigation.mini = !navigation.mini"></v-app-bar-nav-icon>
      <!-- <v-app-bar-nav-icon ></v-app-bar-nav-icon> -->
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
      <v-btn icon @click="toggleTheme()"> <v-icon>mdi-theme-light-dark</v-icon></v-btn>
      <v-btn icon @click="openWelcome()"><v-icon>mdi-home</v-icon></v-btn>
      <v-btn icon ><v-icon>mdi-cog</v-icon></v-btn>
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
          <template v-for="(item, i) in navigation.items">
            <v-subheader v-if="item.group" v-bind:key="item.group">
              <h3> {{ item.group }}</h3>
            </v-subheader>
            <v-list-item v-bind:key="i" :disabled="navigation.itemIndex == i"
                v-bind:class="{'v-list-item--active': navigation.itemIndex == i}" @click="routerTo(i)">
              <v-list-item-icon><v-icon>{{ item.icon }}</v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
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

const navigationItems = [
  { title: '虚拟化资源', icon: 'mdi-alpha-h-circle', router: '/hypervisor' },

  { title: '实例', icon: 'mdi-laptop-account', group: '计算', router: '/server' },
  { title: '计算管理', icon: 'mdi-layers', router: '/compute' },
  { title: '存储', icon: 'mdi-expansion-card', router: '/storage' },
  { title: '镜像', icon: 'mdi-package-variant-closed', router: '/image' },

  { title: '网络资源', icon: 'mdi-web', group: '网络', router: '/networking' },
  { title: '服务地址', icon: 'mdi-server', group: '认证', router: '/endpoint' },
  { title: '租户', icon: 'mdi-account-supervisor', router: '/project' },
  { title: '域', icon: 'mdi-domain', router: '/domain' },
]
let defaultIndex = 0;
export default {
  components: {

  },

  data: () => ({
    name: 'Forward',
    ui: {
      navigationWidth: '200px'
    },
    navigation: {
      itemIndex: localStorage.getItem('navagationIndex') || defaultIndex,
      items: navigationItems,
      mini: false,
    },
    context: {
      clusterId: localStorage.getItem('clusterId'),
      region: null,
    },
    clusterTable: new ClusterTable(),
  }),
  methods: {
    routerTo(index) {
      localStorage.setItem('navagationIndex', index);
      this.navigation.itemIndex == parseInt(index);
      if (this.$route.path != navigationItems[parseInt(index)].router) {
        this.$router.replace({ path: navigationItems[parseInt(index)].router });
      }
    },
    openWelcome() {
      window.open('/welcome', '_self');
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
    toggleTheme(){
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
      SETTINGS.setItem('themeDark', this.$vuetify.theme.dark);
    },
  },
  created() {
    this.$vuetify.theme.dark = SETTINGS.getItem('themeDark').getValue();
    if (!this.$route.path ||  this.$route.path == '/') {
      if (this.navigation.itemIndex >= navigationItems.length) {
        this.navigation.itemIndex = 0;
      }
      this.routerTo(this.navigation.itemIndex);
    }
    this.clusterTable.selected = {};
    this.refresh();
  }
};
</script>
