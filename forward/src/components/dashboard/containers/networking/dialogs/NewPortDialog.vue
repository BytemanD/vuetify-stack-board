<template>
    <v-dialog v-model="display" width="900" scrollable>
        <v-card>
            <v-card-title class="headline grey lighten-2" primary-title>新建端口</v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="10">
                        <v-text-field label="*名字" placeholder="请输入端口名" v-model="dialog.name"
                            :error="!dialog.name"></v-text-field>
                    </v-col>
                    <v-col cols="2" class="my-auto">
                        <v-btn text color="primary" @click="dialog.randomName()">随机名字</v-btn>
                    </v-col>
                    <v-col cols="8">
                        <v-select :items="dialog.networks" label="网络" item-text="name" item-value="id" dense outlined
                            v-model="dialog.networkId" :error="!dialog.networkId">
                        </v-select>
                    </v-col>
                    <v-col cols="4">
                        <v-select :items="dialog.vnicTypes" clearable dense outlined label="VNIC类型"
                            v-model="dialog.vnicType"></v-select>
                    </v-col>
                    <v-col cols="6">
                        <v-select :items="dialog.qosPolicies" clearable dense outlined label="QoS策略"
                            v-model="dialog.qosPolicyId"></v-select>
                        <v-text-field hide-details label="MAC地址" outlined dense placeholder="自定义MAC地址"
                            v-model="dialog.macAddress"></v-text-field>
                    </v-col>
                    <v-col cols="6">
                        <v-switch clearable multiple dense outlined class="my-auto" v-model="dialog.portSecurityEnabled"
                            label="启用安全状态"></v-switch>
                        <!-- TODO: 刷新安全组,根据tenant_id过滤 -->
                        <v-select :items="dialog.securityGroups" @click="dialog.refreshSecurityGroups()" item-text="name"
                            item-value="id" label="安全组" v-model="dialog.portSecurityGroups"></v-select>
                    </v-col>
                    <v-col cols="12">
                        <v-slider v-model="dialog.nums" label="端口数量" class="align-center" ticks="always" max="20" min="1"
                            hide-details>
                            <template v-slot:append><v-chip label small>{{ dialog.nums }}</v-chip></template>
                        </v-slider>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="commit()">创建</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
import i18n from '@/assets/app/i18n';
import { Utils } from '@/assets/app/lib';
import { NewPortDialog } from '@/assets/app/dialogs';

export default {
    props: {
        show: Boolean,
    },
    data: () => ({
        i18n: i18n,
        display: false,
        Utils: Utils,
        dialog: new NewPortDialog(),
    }),
    methods: {
        commit: async function () {
            await this.dialog.commit()
            this.display = false;
            this.$emit('completed');
        }
    },
    created() {

    },
    watch: {
        show(newVal) {
            this.display = newVal;
            if (this.display) {
                this.dialog.init(this.network);
            }
        },
        display(newVal) {
            this.display = newVal;
            this.$emit("update:show", this.display);
        }
    },
};
</script>
