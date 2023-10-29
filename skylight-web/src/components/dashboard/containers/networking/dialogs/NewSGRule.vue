<template>
    <v-dialog v-model="display" width="600" scrollable>
        <v-card>
            <v-card-title class="headline primary lighten-1" primary-title>添加规则</v-card-title>
            <v-card-text class="pt-4">
                <v-row>
                    <v-col cols="12">
                        <v-text-field hide-details label="描述" outlined density='compact' placeholder="请输入描述信息" v-model="dialog.description"></v-text-field>
                    </v-col>
                    <v-col cols="4">
                        <v-select hide-details :items="dialog.directionList" label="方向" v-model="dialog.direction"></v-select>
                    </v-col>
                    <v-col cols="4">
                        <v-select hide-details :items="dialog.ethertypeList" label="ethertype" v-model="dialog.ethertype"></v-select>
                    </v-col>
                    <v-col cols="4">
                        <v-select hide-details clearable :items="dialog.protocolList" label="协议" v-model="dialog.protocol"></v-select>
                    </v-col>
                    <v-col cols="6">
                        <v-text-field hide-details label="对端IP" placeholder="请输入对端IP" v-model="dialog.remoteIp"></v-text-field>
                    </v-col>
                    <v-col cols="6">
                        <v-text-field hide-details label="对端安全组" placeholder="请输入对端安全组" v-model="dialog.remoteGroup"></v-text-field>
                    </v-col>
                    <v-col cols="4">
                        <v-text-field hide-details label="对端端口起始" v-model="dialog.dstPortMin"></v-text-field>
                    </v-col>
                    <v-col cols="4">
                        <v-text-field hide-details label="对端端口结束" v-model="dialog.dstPortMax"></v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-alert type="warning" density='compact' text>对端IP和对端安全组不能同时设置。</v-alert>
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
import { NewSGRuleDialog } from '@/assets/app/dialogs';

export default {
    props: {
        show: Boolean, securityGroup: Object,
    },
    data: () => ({
        i18n: i18n,
        display: false,
        Utils: Utils,
        dialog: new NewSGRuleDialog(),
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
                this.dialog.init(this.securityGroup);
            }
        },
        display(newVal) {
            this.display = newVal;
            this.$emit("update:show", this.display);
        }
    },
};
</script>
