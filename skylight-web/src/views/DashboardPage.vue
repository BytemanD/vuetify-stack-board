<template>
  <v-app>
    <v-navigation-drawer :rail="navigation.mini" :width="ui.navigationWidth.value" :expand-on-hover="navigation.mini">
      <v-list-item title="Skylight">
        <template v-slot:prepend>
          <v-avatar image="/favicon.svg" rounded="0"></v-avatar>
        </template>
      </v-list-item>

      <v-list rounded="xl" density='compact' class="pt-4" open-strategy="single">
        <div v-for="group in navigation.group" v-bind:key="group.name">
          <v-list-subheader class="text-primary">{{ group.name }}</v-list-subheader>
          <v-list-item v-for="(item, i) in group.items" v-bind:key="i" :title="item.title" :value="item" color="primary"
            @click="selectItem(item)" :disabled="navigation.selectedItem == item.title"
            :active="navigation.selectedItem == item.title">
            <template v-slot:prepend><v-icon :icon="item.icon"></v-icon></template>
          </v-list-item>
        </div>
      </v-list>

    </v-navigation-drawer>
    <v-app-bar density="compact">
      <v-app-bar-nav-icon @click="navigation.mini = !navigation.mini"></v-app-bar-nav-icon>
      <v-toolbar-title class="ml-0">
        <v-select hide-details :prefix='`${$t("cluster")}:`' item-title="name" item-value="id" class="rounded-0"
          v-model="clusterTable.selected" :items="clusterTable.items">
        </v-select>
      </v-toolbar-title>
      <v-toolbar-title class="ml-1">
        <v-select solo-inverted flat hide-details clearable class="rounded-0" prepend-icon="mdi-map-marker"
          v-model="context.region" item-title="id" item-value="id" :items="regionTable.items"
          @update:modelValue="changeRegion()">
        </v-select>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <BtnTheme />
      <BtnHome />
      <SettingSheet />
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>
    <v-notifications location="bottom center" :timeout="3000" />
  </v-app>
</template>

<script>
import Init from '@/assets/app/init';
import { ClusterTable, RegionTable } from '@/assets/app/tables';
import SETTINGS from '@/assets/app/settings';

import BtnTheme from '../components/plugins/BtnTheme.vue';
import BtnHome from '../components/plugins/BtnHome.vue';
import i18n from '@/assets/app/i18n';
import SettingSheet from '@/components/dashboard/SettingSheet.vue';
import { Utils } from '@/assets/app/lib';

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
    BtnTheme, BtnHome,
    SettingSheet,
  },

  data: () => ({
    I18N: i18n,
    name: 'Skylight',
    showSettingSheet: false,
    ui: {
      navigationWidth: SETTINGS.ui.getItem('navigatorWidth'),
    },
    navigation: {
      group: navigationGroup,
      selectedItem: navigationGroup[0].items[0].title,
      mini: false,
      drawer: true,
      itemIndex: 0,
    },
    context: {
      clusterId: localStorage.getItem('clusterId'),
      region: {},
    },
    clusterTable: new ClusterTable(),
    regionTable: new RegionTable(),
  }),
  methods: {
    async refresh() {
      await this.clusterTable.refresh();
      for (let i in this.clusterTable.items) {
        if (parseInt(this.context.clusterId) != this.clusterTable.items[i].id) {
          continue
        }
        this.clusterTable.selected = this.clusterTable.items[i];
        break;
      }
      await this.regionTable.refresh();
    },
    initRegion() {
      this.context.region = sessionStorage.getItem('region');
      if (!this.context.region) {
        this.context.region = SETTINGS.openstack.getItem('defaultRegion').value;
        sessionStorage.setItem('region', this.context.region)
      }
    },
    selectItem(item, route) {
      this.navigation.selectedItem = item.title;
      Utils.setNavigationSelectedItem(item);
      if (!route) {
        this.$router.push('/dashboard' + item.router)
      }
      // if (this.$route.path == '/dashboard' || this.$route.path != '/dashboard' + item.router) {
      //   this.$router.replace({ path: '/dashboard' + item.router });
      // }
    },
    getItem() {
      let localItem = Utils.getNavigationSelectedItem();
      if (this.$route.path == '/dashboard' && !localItem) {
        return { index: 0, item: navigationGroup[0].items[0] };
      }

      let selectedItemIndex = -1;
      for (let groupIndex in navigationGroup) {
        let group = navigationGroup[groupIndex];
        for (let itemIndx in group.items) {
          selectedItemIndex += 1;
          let item = group.items[itemIndx];
          if (this.$route.path == item.router || (localItem && localItem.router == item.router)) {
            return { index: selectedItemIndex, item: item }
          }
        }
      }
      return { index: 0, item: navigationGroup[0][0] };
    },
    initItem() {
      let selectedItem = this.getItem();
      this.navigation.itemIndex = selectedItem.index;
      if (this.$route.path == '/dashboard/server/new') {
        this.selectItem(selectedItem.item, '/dashboard/server/new');
      } else if (this.$route.path == '/dashboard/hypervisor/tenantUsage') {
        this.selectItem(selectedItem.item, '/dashboard/hypervisor');
      } else {
        this.selectItem(selectedItem.item,);
      }
    },
    getItemIndexByRoutePath(routePath) {
      let itemIndex = -1;
      for (let groupIndex in navigationGroup) {
        let group = navigationGroup[groupIndex];
        for (let index in group.items) {
          let item = group.items[index];
          itemIndex += 1;
          if (routePath == item.router) {
            return itemIndex;
          }
        }
      }
    },
    changeRegion() {
      sessionStorage.setItem('region', this.context.region);
      location.reload();
    }
  },
  created() {
    Init()
    this.initItem();

    this.$vuetify.theme.dark = SETTINGS.ui.getItem('themeDark').value;

    this.refresh();
    this.initRegion();
  }
}
</script>
