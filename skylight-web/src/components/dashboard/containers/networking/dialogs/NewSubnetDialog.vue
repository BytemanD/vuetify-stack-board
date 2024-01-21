<template>
    <v-dialog v-model="display" width="600" scrollable>
        <v-card>
            <v-card-title class="headline primary lighten-2" primary-title>网络: {{ dialog.network.name || dialog.network.id
            }}</v-card-title>
            <v-card-text>
                <v-text-field label="子网名" placeholder="请输入子网名" v-model="dialog.name" :error="!dialog.name"
                    :rules="[dialog.checkNameNotNull]">
                    <template v-slot:append>
                        <v-btn variant='text' color="primary" @click="dialog.refreshName()">随机名字</v-btn>
                    </template>
                </v-text-field>
                <v-text-field density='compact' outlined label="CIDR" placeholder="请输入cidr" v-model="dialog.cidr"
                    :error="!dialog.cidr" :rules="[dialog.checkCidr]">
                </v-text-field>

                <v-radio-group inline hide-details color="info" v-model="dialog.ipVersion">
                    <template v-slot:prepend>IP版本</template>
                    <v-radio label="4" value="4"></v-radio>
                    <v-radio label="6" value="6" class="ml-10"></v-radio>
                </v-radio-group>
                <v-switch hide-details color="info" v-model="dialog.enableDhcp">
                    <template v-slot:prepend>启用DHCP</template>
                </v-switch>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="commit()">添加</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
import i18n from '@/assets/app/i18n';
import { NewSubnetDialog } from '@/assets/app/dialogs';
import { Utils } from '@/assets/app/lib';

export default {
    props: {
        show: Boolean,
        network: Object,
    },
    data: () => ({
        i18n: i18n,
        display: false,
        dialog: new NewSubnetDialog(),
        Utils: Utils
    }),
    methods: {
        commit: async function () {
            await this.dialog.commit()
            this.display = false;
            this.$emit('completed');
        }
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
