<template>
    <v-dialog v-model="display" width="900" scrollable>
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon="mdi-plus" fab color="primary"></v-btn>
        </template>

        <v-card>
            <v-card-title class="headline primary lighten-2" primary-title>新建端口</v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="10">
                        <v-text-field label="*名字" placeholder="请输入端口名" v-model="dialog.name"
                            :error="!dialog.name"></v-text-field>
                    </v-col>
                    <v-col cols="2" class="my-auto">
                        <v-btn variant="text" color="primary" @click="dialog.refreshName()">随机名字</v-btn>
                    </v-col>
                    <v-col cols="6">
                        <v-select :items="dialog.networks" label="网络" :item-props="dialog.itemProps" item-value="id" density='compact'
                            outlined v-model="dialog.networkId" :error="!dialog.networkId">
                        </v-select>
                        <v-select :items="dialog.vnicTypes" clearable density='compact' outlined label="VNIC类型"
                            v-model="dialog.vnicType"></v-select>
                        <v-select :items="dialog.qosPolicies" clearable density='compact' outlined label="QoS策略"
                            :item-props="dialog.itemProps" item-title="id" v-model="dialog.qosPolicyId"></v-select>
                        <v-text-field hide-details label="MAC地址" outlined density='compact' placeholder="自定义MAC地址"
                            v-model="dialog.macAddress"></v-text-field>
                    </v-col>
                    <v-col cols="6">
                        <v-switch clearable outlined hide-details density='compact' color="info" class="my-auto" v-model="dialog.portSecurityEnabled"
                            label="启用安全组">
                        </v-switch>
                        <!-- TODO: 刷新安全组,根据tenant_id过滤 -->
                        <v-select :items="dialog.securityGroups" @click="dialog.refreshSecurityGroups()" :item-props="dialog.itemProps"
                            multiple item-value="id" label="安全组" v-model="dialog.portSecurityGroups"></v-select>
                    </v-col>
                    <v-col cols="12">
                        <v-slider v-model="dialog.nums" label="端口数量" class="align-center" max="20" min="1" step="1"
                            hide-details show-ticks="always" tick-size="4" color="info">
                            <template v-slot:append><v-chip label small>{{ dialog.nums }}</v-chip></template>
                        </v-slider>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="flat" color="primary" @click="commit()">创建</v-btn>
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
        this.dialog.init()
    },
    watch: {
        display(newVal) {
            if (this.display) {
                this.dialog.init()
            }
        }
    },
};
</script>
