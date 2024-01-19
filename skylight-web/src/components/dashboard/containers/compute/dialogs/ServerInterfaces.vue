<template>
    <v-dialog scrollable v-model="display" width="900">
        <v-card>
            <v-card-title class="headline primary lighten-2">
                虚拟机网卡管理
                <btn-router-link router-to='/dashboard/networking' text="网络资源" />
            </v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="12">
                        <v-data-table density='compact' :headers="dialog.table.headers" :items="dialog.attachments"
                            class="elevation-2" v-model="dialog.table.selected">
                            <template v-slot:[`item.fixed_ips`]="{ item }">
                                <v-chip size="small" v-for="(fixed_ip) in item.fixed_ips" v-bind:key="fixed_ip.ip_address">
                                    {{ fixed_ip.ip_address }}</v-chip>
                            </template>
                            <template v-slot:[`item.actions`]="{ item }">
                                <v-btn size="small" icon="mdi-close" variant="text" color="red" @click="dialog.detach(item)"></v-btn>
                            </template>
                        </v-data-table>
                    </v-col>
                    <v-col cols="10">
                        <v-select multiple chips outlined hide-details :items="dialog.ports" label="选择端口" item-value="id"
                            :item-props="(item) => { return { title: item.id, subtitle: item.name } }"
                            v-model="dialog.selected">
                        </v-select>
                    </v-col>
                    <v-col cols="2" class="my-auto">
                        <v-btn color="primary" @click="attachSelectedPorts()">挂载</v-btn></v-col>

                    <v-col cols="10">
                        <v-select multiple chips outlined hide-details :items="dialog.networks" label="选择网络" item-value="id"
                            :item-props="(item) => { return { title: item.id, subtitle: item.name } }"
                            v-model="dialog.netSelected">
                        </v-select>
                    </v-col>
                    <v-col cols="2" class="my-auto">
                        <v-btn color="primary" @click="attachSelectedNets()">挂载</v-btn>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>
<script>
import i18n from '@/assets/app/i18n';
import { Utils } from '@/assets/app/lib';
import { ServerInterfaceDialog } from '@/assets/app/dialogs';
import BtnRouterLink from '@/components/plugins/BtnRouterLink.vue';

export default {
    props: {
        show: Boolean,
        server: Object,
    },
    components: {
        BtnRouterLink
    },
    data: () => ({
        i18n: i18n,
        Utils: Utils,
        display: false,
        dialog: new ServerInterfaceDialog(),
    }),
    methods: {
        attachSelectedPorts: async function () {
            await this.dialog.attachSelected();
            this.$emit('completed');
        },
        attachSelectedNets: async function () {
            await this.dialog.attachSelectedNets();
            this.$emit('completed');
        }
    },
    created() {
    },
    watch: {
        show(newVal) {
            this.display = newVal;
        },
        display(newVal) {
            this.display = newVal;
            if (this.display) {
                this.dialog.init(this.server);
            }
            this.$emit("update:show", this.display);
        }
    },
};
</script>