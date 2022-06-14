import { MESSAGE, Message, Utils } from "./vstackboard/lib.js";
import { newEnv } from "./vstackboard/dialogs.js";

import API from "./vstackboard/api.js";

new Vue({
    el: '#app',
    delimiters: ['[[', ']]'],
    vuetify: new Vuetify(),
    data: {
        api: API,
        newEnv: newEnv,
        envs: []
    },
    methods: {
        useCluster: function(cluster){
            $cookies.set('envName', cluster.name);
            window.open('/dashboard', '_self');
        }
    },
    created: function () {
        API.env.list().then(resp => {
            this.envs = resp.data.envs
        })
    },

});
