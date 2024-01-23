<template>
    <v-dialog v-model="display" width="800">
        <v-card title="选择节点">
            <template v-slot:append>
                <v-btn color="primary" @click="addHosts()">添加</v-btn>
            </template>
            <v-card-text class="mt-1">
                <v-data-table density='compact' show-select item-value='hypervisor_hostname' :headers="dialog.headers"
                    :items="dialog.hosts" :items-per-page="dialog.hypervisorTable.itemsPerPage"
                    :search="dialog.hypervisorTable.search" v-model="dialog.hypervisorTable.selected">
                </v-data-table>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>
<script>
import i18n from '@/assets/app/i18n';
import { Utils } from '@/assets/app/lib';

import { AggAddHostsDialog } from '@/assets/app/dialogs';

export default {
    props: {
        show: Boolean, aggregate: Object,
    },
    data: () => ({
        i18n: i18n,
        Utils: Utils,
        display: false,
        itemsPerPage: 10,
        dialog: new AggAddHostsDialog(),
    }),
    methods: {
        addHosts: async function () {
            await this.dialog.addHosts();
            // this.display = false;
            this.$emit('completed');
        },
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