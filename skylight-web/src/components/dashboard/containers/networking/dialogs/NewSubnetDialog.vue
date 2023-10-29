<template>
    <v-dialog v-model="display" width="600" scrollable>
        <v-card>
            <v-card-title class="headline primary lighten-2" primary-title>网络: {{  dialog.network.name || dialog.network.id }}</v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="10">
                        <v-text-field label="*子网名字" placeholder="请输入子网名" v-model="dialog.name" :error="!dialog.name"></v-text-field>
                    </v-col>
                    <v-col cols="2" class="my-auto">
                        <v-btn text color="primary" @click="dialog.refreshName()">随机名字</v-btn>
                    </v-col>
                    <v-col cols="6">
                        <v-text-field density='compact' outlined  label="CIDR" placeholder="请输入cidr" v-model="dialog.cidr" :error="!dialog.cidr" :rules="[dialog.checkCidr]"></v-text-field>
                        <v-select density='compact' outlined :items="dialog.ipVersions" label="IP版本" v-model="dialog.ipVersion"></v-select>
                    </v-col>
                    <v-col cols="6">
                        <v-switch density='compact' v-model="dialog.enableDhcp" label="启用DHCP" class="my-auto"></v-switch>
                    </v-col>
                </v-row>
                <v-alert density='compact' outlined type="error" v-if="dialog.errorMessage">[[ dialog.errorMessage ]]</v-alert>
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
