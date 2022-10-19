import { MESSAGE } from "./vstackboard/lib.js";
import { newCluster, clusterTable } from "./vstackboard/objects.js";

import API from "./vstackboard/api.js";

new Vue({
    el: '#app',
    delimiters: ['[[', ']]'],
    vuetify: new Vuetify(),
    data: {
        api: API,
        newCluster: newCluster,
        clusterTable: clusterTable,
        newVersion: {}
    },
    methods: {
        useCluster: function(cluster){
            $cookies.set('clusterId', cluster.id);
            $cookies.set('clusterName', cluster.name);
            axios.get('/identity/').then(resp => {
                window.open('/dashboard', '_self');
            }).catch(error => {
                MESSAGE.error(`连接 ${cluster.name} 失败`)
            })
        },
        checkLastVersion: async function(){
            this.newVersion = await API.actions.checkLastVersion()
        }
    },
    created: function () {
        this.clusterTable.refresh();
        this.checkLastVersion();
    },
});
