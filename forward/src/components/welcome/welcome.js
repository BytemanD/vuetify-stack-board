import Vue from 'vue'
import VueRouter from 'vue-router';
import axios from 'axios';
import VueCookies from 'vue-cookies';

import vuetify from '../../plugins/vuetify'

import ErrorPage from '../ErrorPage.vue'
import WelcomePage from './WelcomePage.vue'

Vue.use(VueRouter)
Vue.use(VueCookies, { expires: '7d'})
Vue.config.productionTip = false

const CONFIG = 'config.json'

axios.get(CONFIG).then((resp) => {
    axios.defaults.baseURL = resp.data.backend_url;

    new Vue({
        vuetify,
        render: h => h(WelcomePage),
    }).$mount('#app')
}).catch((error) => {
    let propsData = {
        title: `无法获取服务配置 ${CONFIG}`,
        error: error,
    }
    new Vue({
        vuetify,
        render: h => h(ErrorPage, {props: propsData}),
    }).$mount('#app')
});
