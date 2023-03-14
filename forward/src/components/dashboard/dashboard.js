import Vue from 'vue'
import VueI18n from 'vue-i18n'
import VueRouter from 'vue-router';
import axios from 'axios';

import vuetify from '../../plugins/vuetify'
import DashBoard from './DashBoard.vue';
import ServersPage from './containers/ServerPage';
import HypervisorPage from './containers/HypervisorPage';
import ComputePage from './containers/ComputePage';
import StoragePage from './containers/StoragePage';
import ImagePage from './containers/ImagePage'
import NetworkPage from './containers/NetworkPage';
import EndpointPage from './containers/EndpointPage';
import ProjectPage from './containers/ProjectPage';
import DomainPage from './containers/DomainPage';


axios.defaults.baseURL = 'http://vstackboard.local';

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
    ]
})

Vue.config.productionTip = false

new Vue({
    vuetify,
    VueI18n,
    router,
    render: h => h(DashBoard),
}).$mount('#app')
