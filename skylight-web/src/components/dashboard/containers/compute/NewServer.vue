<template>
    <v-row>
        <v-col cols="8">
            <v-toolbar density="compact" class="rounded">
                <v-breadcrumbs :items="breadcrumbItems" color="info" active-color="red" density="compact">
                    <template v-slot:divider>
                        <v-icon icon="mdi-chevron-right"></v-icon>
                    </template>
                </v-breadcrumbs>
            </v-toolbar>
        </v-col>
        <v-col cols="4" class="text-right">
            <v-btn @click="dialog.commit()" color="primary">提交</v-btn>
        </v-col>
        <v-col cols="12" class="mt-0 pt-0">
            <v-stepper :items="['基本设置', '安全', '自定义']" editable hide-actions>
                <template v-slot:item.1>
                    <v-row>
                        <v-col cols="10">
                            <v-text-field label="名字:" placeholder="请输入实例名" v-model="dialog.params.name"
                                :error="!dialog.params.name" :rules="[dialog.checkNotNull]" density="compact">
                            </v-text-field>
                        </v-col>
                        <v-col cols="2">
                            <v-btn class="mt-2" color="info" variant="text"
                                @click="dialog.params.name = Utils.getRandomName('server')">随机名字</v-btn>
                        </v-col>
                        <v-col cols="6">
                            <v-select :items="dialog.flavors" label="规格" density='compact' item-value="id"
                            :item-props="dialog.itemProps" v-model="dialog.params.flavor" :error="!dialog.params.flavor">
                            </v-select>
                            <v-select :items="dialog.images" label="镜像" density='compact' :item-props="dialog.itemProps" item-value="id"
                                v-model="dialog.params.image" :error="!dialog.params.image">
                            </v-select>
                        </v-col>
                        <v-col cols="6">
                            <v-select :items="dialog.networks" clearable label="网络" density='compact' :item-props="dialog.itemProps"
                                item-value="id" v-model="dialog.params.netId" @click="dialog.refresNetworks()">
                            </v-select>
                            <v-select clearable density='compact' :items="dialog.ports" label="端口:" :item-props="dialog.itemProps"
                                item-value="id" messages="如果选择端口，只能创建一台虚拟机。" v-model="dialog.portId"
                                @click="dialog.refresPorts()">
                            </v-select>
                        </v-col>
                        <v-col cols="2">
                            <v-switch v-model="dialog.useBdm" label="创建卷" color="info" class="my-auto"
                                hide-details></v-switch>
                        </v-col>
                        <v-col cols="4">
                            <v-select hide-details :disabled="!dialog.useBdm" :items="dialog.volumeTypes" clearable
                                label="卷类型" density='compact' item-title="name" item-value="name"
                                @click="dialog.refreshVolumeTypes()" v-model="dialog.volumeType">
                            </v-select>
                        </v-col>
                        <v-col cols="12">
                            <v-slider :disabled="!dialog.useBdm" hide-details v-model="dialog.volumeSize" label="卷大小"
                                max="100" :min="dialog.volumeSizeMin" step="10" show-ticks="always" tick-size="4"
                                color="info">
                                <template v-slot:append><v-chip label small>{{ dialog.volumeSize }} GB</v-chip></template>
                            </v-slider>
                        </v-col>
                    </v-row>
                </template>

                <template v-slot:item.2>
                    <v-select :items="dialog.securityGroups" clearable label="安全组" :item-props="dialog.itemProps" item-value="id"
                        v-model="dialog.securityGroup" persistent-hint hint="只能选择当前租户的安全组"
                        @click="dialog.refreshSecurityGroups()">
                    </v-select>
                    <v-text-field label="密码" placeholder="请输入实例密码" v-model="dialog.params.password"></v-text-field>
                    <v-select :items="dialog.keypairs" clearable label="密钥对" item-title="keypair.name"
                        item-value="keypair.name" v-model="dialog.keypair" @click="dialog.refreshKeypairs()"></v-select>
                </template>

                <template v-slot:item.3>
                    <v-row>
                        <v-col cols="6">
                            <v-text-field hide-details label="描述" outlined density='compact' placeholder="请输入描述信息"
                                v-model="dialog.description"></v-text-field>
                        </v-col>
                        <v-col lg="12">
                            <v-range-slider v-model="dialog.params.nums" label="实例数量" max="20" min="1" step="1"
                                show-ticks="always" tick-size="4" color="info" hide-details strict>
                                <template v-slot:prepend><v-chip label small>{{ dialog.params.nums[0] }}</v-chip></template>
                                <template v-slot:append><v-chip label small>{{ dialog.params.nums[1] }}</v-chip></template>
                            </v-range-slider>
                        </v-col>
                        <v-col lg="6">
                            <v-select :items="dialog.azList" clearable label="AZ" placeholder="请选择AZ" item-title="zoneName"
                                v-model="dialog.params.az" @click="dialog.refreshAzList()">
                            </v-select>
                        </v-col>
                        <v-col lg="6">
                            <v-select :disabled="!dialog.params.az" :items="dialog.azHosts[dialog.params.az]" clearable label="节点" placeholder="请选择节点"
                                v-model="dialog.params.host" item-value="value" item-title="title">
                            </v-select>
                        </v-col>
                    </v-row>
                </template>
            </v-stepper>
        </v-col>
    </v-row>
</template>
<script>
import { NewServerDialog } from '@/assets/app/dialogs';
import { Utils } from '@/assets/app/lib';
import SETTINGS from '@/assets/app/settings';
export default {
    props: {

    },
    data: () => ({
        breadcrumbItems: [
            {
                title: '实例',
                href: '#/dashboard/server',
            },
            {
                title: '新建',
                disabled: true,
            },
        ],
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

    },
};
</script>