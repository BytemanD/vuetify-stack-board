<template>
    <v-dialog v-model="display" width="900" scrollable>
        <v-card>
            <v-card-text height="300" class="pa-0">
                <v-stepper elevation="0" vertical height="510">
                    <v-stepper-step step="1" color="success" editable="editable"><h2>基本设置</h2></v-stepper-step>
                    <v-stepper-content step="1">
                        <v-row >
                            <v-col cols="10">
                                <v-text-field label="名字" placeholder="请输入实例名" v-model="dialog.params.name"
                                    :error="!dialog.params.name" :rules="[dialog.checkNotNull]">
                                </v-text-field>
                            </v-col>
                            <v-col cols="2">
                                <v-btn class="mt-4" text color="primary"
                                    @click="dialog.params.name = Utils.getRandomName('server')">随机名字</v-btn>
                            </v-col>
                            <v-col cols="6">
                                <v-select :items="dialog.flavors" label="规格" dense item-text="name"
                                    item-value="id" v-model="dialog.params.flavor" :error="!dialog.params.flavor">
                                </v-select>
                                <v-select :items="dialog.images" label="镜像" dense item-text="name" item-value="id"
                                    v-model="dialog.params.image" :error="!dialog.params.image">
                                </v-select>
                            </v-col>
                            <v-col cols="6">
                                <v-select :items="dialog.networks" clearable label="网络" dense item-text="name"
                                    item-value="id" v-model="dialog.params.netId" @click="dialog.refresNetworks()">
                                </v-select>
                                <v-select clearable dense :items="dialog.ports" label="端口" item-text="name" item-value="id"
                                    messages="如果选择端口，只能创建一台虚拟机。" v-model="dialog.portId" @click="dialog.refresPorts()">
                                </v-select>
                            </v-col>
                            <v-col cols="2">
                                <v-switch v-model="dialog.useBdm" label="创建卷" class="my-auto"
                                    hide-details></v-switch>
                            </v-col>
                            <v-col cols="4">
                                <v-select hide-details :disabled="!dialog.useBdm" :items="dialog.volumeTypes"
                                    clearable label="卷类型" dense item-text="name" item-value="id"
                                    @click="dialog.refreshVolumeTypes()" v-model="dialog.volumeType">
                                    <template v-slot:selection="{ item }"> {{ item.name }} </template>
                                </v-select>
                            </v-col>
                            <v-col cols="12">
                                <v-slider :disabled="!dialog.useBdm" hide-details v-model="dialog.volumeSize"
                                    ticks="always" label="系统卷大小" max="100" :min="dialog.volumeSizeMin" step="10">
                                    <template v-slot:append>
                                        <v-chip label small>{{ dialog.volumeSize }} GB</v-chip>
                                    </template>
                                </v-slider>
                            </v-col>
                        </v-row>
                    </v-stepper-content>
                    <v-stepper-step step="2" color="success" editable="editable"><h2>{{ i18n.t('security') }}</h2></v-stepper-step>
                    <v-stepper-content step="2">
                        <v-select :items="dialog.securityGroups" clearable label="安全组" item-text="name" item-value="id"
                            v-model="dialog.securityGroup" persistent-hint hint="只能选择当前租户的安全组"
                            @click="dialog.refreshSecurityGroups()">
                        </v-select>
                        <v-text-field label="密码" placeholder="请输入实例密码" v-model="dialog.params.password"></v-text-field>
                        <v-select :items="dialog.keypairs" clearable label="密钥对" item-text="keypair.name"
                            item-value="keypair.name" v-model="dialog.keypair" @click="dialog.refreshKeypairs()"></v-select>
                    </v-stepper-content>
                    <v-stepper-step step="3" color="success" editable="editable"><h2>自定义</h2></v-stepper-step>
                    <v-stepper-content step="3">
                        <v-slider v-model="dialog.params.nums" label="实例数量" ticks="always" max="10"
                            min="1" :disabled="dialog.portId != null">
                            <template v-slot:append><v-chip label small>{{ dialog.params.nums }}</v-chip></template>
                        </v-slider>
                        <v-row>
                            <v-col>
                                <v-select :items="dialog.azList" clearable label="AZ" placeholder="请选择AZ"
                                    item-text="zoneName" v-model="dialog.params.az" @click="dialog.refreshAzList()">
                                    <template v-slot:selection="{ item }"> {{ item.zoneName }} </template>
                                </v-select>
                            </v-col>
                            <v-col>
                                <v-select :items="dialog.azHosts[dialog.params.az]" clearable label="节点" placeholder="请选择节点"
                                    v-model="dialog.params.host">
                                    <template v-slot:selection="{ item }"> {{ item }} </template>
                                </v-select>
                            </v-col>
                        </v-row>
                    </v-stepper-content>
                </v-stepper>
            </v-card-text>
            <v-card-title class="info">
                <v-spacer></v-spacer><v-btn @click="dialog.commit()">创建</v-btn>
            </v-card-title>
        </v-card>
    </v-dialog>
</template>
<script>
import i18n from '@/assets/app/i18n';
import { NewServerDialog } from '@/assets/app/dialogs';
import { Utils } from '@/assets/app/lib';
import SETTINGS from '@/assets/app/settings';
export default {
    props: {
        show: Boolean,
        table: Object,
    },
    data: () => ({
        i18n: i18n,
        display: false,
        Utils: Utils,
        SETTINGS: SETTINGS,
        dialog: null,
    }),
    methods: {

    },
    created() {
        this.dialog = new NewServerDialog(this.table);
        this.dialog.init();
    },
    watch: {
        show(newVal) {
            this.display = newVal;
        },
        display(newVal) {
            this.display = newVal;
            this.$emit("update:show", this.display);
        }
    },
};
</script>