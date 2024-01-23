<template>
    <v-dialog v-model="display" width="600">
        <v-card title="节点管理">
            <v-card-text class="mt-1">
                <v-data-table density='compact' :headers="dialog.headers" item-key="name" :items="dialog.hosts" :items-per-page="itemsPerPage"
                    :search="dialog.search" v-model="dialog.selected">
                    <template v-slot:[`item.actions`]="{ item }">
                        <v-btn icon="mdi-close" size="small" variant="text" color="red" @click="removeHost(item.name)"></v-btn>
                    </template>
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
        removeHost: async function(host){
            await this.dialog.removeHost(host);
            this.$emit('completed');
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