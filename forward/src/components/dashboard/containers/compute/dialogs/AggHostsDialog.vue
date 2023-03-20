<template>
    <v-dialog v-model="display" width="800">
        <v-card>
            <v-card-title class="headline primary lighten-2" primary-title>节点</v-card-title>
            <v-card-text>
                <v-btn small color="primary" @click="addHosts()">添加</v-btn>
                <v-btn small color="error" @click="removeHosts()">移除</v-btn>
                <br>
                <v-data-table dense :headers="dialog.headers" item-key="name" :items="dialog.hosts" :items-per-page="itemsPerPage"
                    :search="dialog.search" show-select v-model="dialog.selected">
                </v-data-table>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>
<script>
import i18n from '@/assets/app/i18n';
import { Utils } from '@/assets/app/lib';

import { AggHostsDialog } from '@/assets/app/dialogs';

export default {
    props: {
        show: Boolean, aggregate: Object,
    },
    data: () => ({
        i18n: i18n,
        Utils: Utils,
        display: false,
        itemsPerPage: 10,
        dialog: new AggHostsDialog(),
    }),
    methods: {
        addHosts: function() {
            this.dialog.addHosts();
        },
        removeHosts: function() {
            this.dialog.removeHosts();
        }
    },
    created() {
    },
    watch: {
        show(newVal) {
            this.display = newVal;
            if (this.display) {
                this.dialog.init(this.aggregate);
            }
        },
        display(newVal) {
            this.display = newVal;
            this.$emit("update:show", this.display);
        }
    },
};
</script>