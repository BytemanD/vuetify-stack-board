import Vue from 'vue'
import VueI18n from 'vue-i18n'
import VueRouter from 'vue-router';
import axios from 'axios';

import vuetify from '../../plugins/vuetify'
import { MESSAGE } from '@/assets/app/lib';

import ErrorPage from '../ErrorPage.vue'
import DashBoard from './DashBoard.vue';
import HypervisorPage from './containers/overview/HypervisorPage';
import ServersPage from './containers/compute/ServerPage';
import ComputePage from './containers/compute/ComputePage';
import StoragePage from './containers/storage/StoragePage';
import ImagePage from './containers/image/ImagePage'
import NetworkPage from './containers/networking/NetPage';

import EndpointPage from './containers/identity/EndpointPage';
import ProjectPage from './containers/identity/ProjectPage';
import DomainPage from './containers/identity/DomainPage';

import FlavorPage from './containers/compute/FlavorPage';

Vue.use(VueRouter)


let router = new VueRouter({
    routes: [
        { path: '/hypervisor', component: HypervisorPage },
        { path: '/server', component: ServersPage },
        { path: '/compute', component: ComputePage},
        { path: '/image', component: ImagePage},
        { path: '/storage', component: StoragePage},
        { path: '/networking', component: NetworkPage},
        { path: '/endpoint', component: EndpointPage},
        { path: '/project', component: ProjectPage},
        { path: '/domain',    component: DomainPage},
        { path: '/compute/flavor', components: {computeTabs: () => FlavorPage}},
    ]
})

Vue.config.productionTip = false;

const CONFIG = 'config.json'

if (localStorage.getItem('clusterId') == null){
  console.warn('即将跳转到欢迎页面');
  MESSAGE.warning('即将跳转到欢迎页面');
  window.open('/welcome.html', '_self');
}

axios.get(CONFIG).then((resp) => {
    axios.defaults.baseURL = resp.data.backend_url;
    localStorage.static_stylesheet = JSON.stringify(resp.data.static_stylesheet);

    new Vue({
        vuetify,
        VueI18n,
        router,
        render: h => h(DashBoard),
    }).$mount('#app')
}).catch((error) => {
    let propsData = {
        title: `无法获取服务配置 ${CONFIG}`,
        error: error,
    };
    new Vue({
        vuetify,
        VueI18n,
        render: h => h(ErrorPage, {props: propsData}),
    }).$mount('#app')
});
