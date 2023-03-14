import Vue from 'vue'
import VueRouter from 'vue-router';
import axios from 'axios';

import VueCookies from 'vue-cookies';

import vuetify from '../../plugins/vuetify'

import WelcomePage from './WelcomePage.vue'

axios.defaults.baseURL = 'http://vstackboard.local';
Vue.use(VueRouter)
Vue.use(VueCookies, { expires: '7d'})

Vue.config.productionTip = false

new Vue({
    vuetify,
    render: h => h(WelcomePage),
}).$mount('#app')
