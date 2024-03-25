<template>
    <v-app>
        <v-app-bar :elevation="2" density="compact">
            <v-app-bar-title>新建实例</v-app-bar-title>
            <v-tabs v-model="tab" color="primary" grow>
                <v-tab value="base"><v-icon start>mdi-cog</v-icon>基本设置</v-tab>
                <v-tab value="network"><v-icon start>mdi-web</v-icon>网络</v-tab>
                <v-tab value="security"><v-icon start>mdi-security</v-icon>安全</v-tab>
                <v-tab value="custome"><v-icon start>mdi-pencil-circle</v-icon>自定义</v-tab>
            </v-tabs>
            <v-spacer></v-spacer>
            <template v-slot:append>
                <v-btn variant="flat" @click="dialog.commit()" color="primary">创建</v-btn>
            </template>
        </v-app-bar>
        <v-main class="bg-grey-lighten-2">
            <v-window v-model="tab">
                <v-window-item value="base">
                    <v-col>
                        <v-card elevation="2">
                            <v-card-text>
                                <v-text-field placeholder="请输入实例名" v-model="dialog.name" :error="!dialog.name"
                                    :messages="dialog.validName()" density="compact" hide-details>
                                    <template v-slot:prepend>名字</template>
                                    <template v-slot:append>
                                        <v-btn class="my-auto" color="info" variant="text"
                                            @click="dialog.name = Utils.getRandomName('server')">随机名字</v-btn>
                                    </template>
                                </v-text-field>

                            </v-card-text>
                        </v-card>
                        <v-card elevation="2" class="mt-1">
                            <v-card-text>
                                <v-text-field class="mb-1" density="compact" readonly
                                    :value="dialog.flavor && dialog.flavor.name" :error="!dialog.flavor.id"
                                    :messages="dialog.validFlavor()">
                                    <template v-slot:prepend>规格</template>
                                </v-text-field>
                                <flavor-table class="ml-10" @select-flavor="(flavor) => { selectFlavor(flavor) }" />
                            </v-card-text>
                        </v-card>
                        <v-card class="mt-1" elevation="2">
                            <v-card-text>
                                <v-text-field class="mb-1" density="compact" readonly
                                    :value="dialog.image && (dialog.image.name || dialog.image.id)"
                                    :error="!dialog.image.id" :messages="dialog.validImage()">
                                    <template v-slot:prepend>镜像</template>
                                </v-text-field>
                                <image-table class="ml-10" @select-image="(image) => { selectImage(image) }" />
                            </v-card-text>
                        </v-card>
                        <v-card elevation="2" class="mt-1">
                            <v-card-text>
                                <v-row>
                                    <v-col md="4" lg="2">
                                        <v-checkbox hide-details v-model="dialog.useBdm" color="info" class="my-auto"
                                            label="创建卷"></v-checkbox>
                                    </v-col>
                                    <v-col>
                                        <v-select :disabled="!dialog.useBdm" :items="dialog.volumeTypes" clearable
                                            density='compact' item-title="name" item-value="name" placeholder="请选择卷类型"
                                            @click="dialog.refreshVolumeTypes()" v-model="dialog.volumeType"
                                            label="卷类型">
                                        </v-select>
                                    </v-col>
                                </v-row>
                                <v-slider :disabled="!dialog.useBdm" v-model="dialog.volumeSize" color="info"
                                    show-ticks="always" tick-size="4" :min="dialog.volumeSizeMin" max="100" step="10">
                                    <template v-slot:prepend>卷大小</template>
                                    <template v-slot:append>{{ dialog.volumeSize }} GB</template>
                                </v-slider>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-window-item>
                <v-window-item value="network">
                    <v-col>
                        <v-card elevation="2">
                            <v-card-text>
                                <v-col lg="6" md="8">
                                    <v-select :items="dialog.networks" clearable density='compact'
                                        :item-props="dialog.itemProps" item-value="id" v-model="dialog.params.netId"
                                        @click="dialog.refresNetworks()">
                                        <template v-slot:prepend>网络</template>
                                    </v-select>
                                    <v-select clearable density='compact' :items="dialog.ports"
                                        :item-props="dialog.itemProps" item-value="id" messages="如果选择端口，只能创建一台虚拟机。"
                                        v-model="dialog.portId" @click="dialog.refresPorts()">
                                        <template v-slot:prepend>端口</template>
                                    </v-select>
                                </v-col>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-window-item>
                <v-window-item value="security">
                    <v-col>
                        <v-card elevation="2">
                            <v-card-text>
                                <v-col lg="6" md="8">
                                    <v-select :items="dialog.securityGroups" clearable :item-props="dialog.itemProps"
                                        item-value="id" v-model="dialog.securityGroup" persistent-hint
                                        hint="只能选择当前租户的安全组" @click="dialog.refreshSecurityGroups()">
                                        <template v-slot:prepend>安全组</template>
                                    </v-select>
                                    <v-text-field placeholder="请输入实例密码" v-model="dialog.params.password">
                                        <template v-slot:prepend>密码</template>
                                    </v-text-field>
                                    <v-select :items="dialog.keypairs" clearable item-title="keypair.name"
                                        item-value="keypair.name" v-model="dialog.keypair"
                                        @click="dialog.refreshKeypairs()">
                                        <template v-slot:prepend>密钥对</template>
                                    </v-select>
                                </v-col>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-window-item>
                <v-window-item value="custome">
                    <v-col>
                        <v-card elevation="2">
                            <v-card-text>
                                <v-col lg="6" md="8" class="mt-0">
                                    <v-text-field density='compact' placeholder="请输入描述信息" v-model="dialog.description">
                                        <template v-slot:prepend>描述</template>
                                    </v-text-field>
                                    <v-select density='compact' :items="dialog.azList" clearable placeholder="请选择AZ"
                                        item-title="zoneName" v-model="dialog.params.az"
                                        @click="dialog.refreshAzList()">
                                        <template v-slot:prepend>AZ</template>
                                    </v-select>
                                    <v-select density='compact' :disabled="!dialog.params.az"
                                        :items="dialog.azHosts[dialog.params.az]" clearable placeholder="请选择节点"
                                        v-model="dialog.params.host" item-value="value" item-title="title">
                                        <template v-slot:prepend>节点</template>
                                    </v-select>
                                </v-col>

                            </v-card-text>
                        </v-card>
                        <v-card elevation="2" class="mt-1">
                            <v-card-text>
                                <v-range-slider v-model="dialog.params.nums" label="实例数量" max="20" min="1" step="1"
                                    show-ticks="always" tick-size="4" color="info" hide-details strict>
                                    <template v-slot:prepend><v-chip label small>{{ dialog.params.nums[0]
                                            }}</v-chip></template>
                                    <template v-slot:append><v-chip label small>{{ dialog.params.nums[1]
                                            }}</v-chip></template>
                                </v-range-slider>
                            </v-card-text>
                        </v-card>

                    </v-col>
                </v-window-item>
            </v-window>
            <v-notifications location="bottom right" :timeout="3000" />
        </v-main>
    </v-app>
</template>
<script>
import { NewServerDialog } from '@/assets/app/dialogs';
import { Utils } from '@/assets/app/lib';
import SETTINGS from '@/assets/app/settings';

import ImageTable from '@/components/plugins/tables/ImageTable.vue';
import FlavorTable from '@/components/plugins/tables/FlavorTable.vue';

export default {
    components: {
        ImageTable, FlavorTable,
    },
    props: {

    },
    data: () => ({
        tab: 0,
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
        dialog: {},
        selectedImage: {},
        selectedFlavor: {},
        imageSearch: null,
    }),
    methods: {
        selectImage: function (item) {
            this.dialog.image = item;
        },
        selectFlavor: function (item) {
            this.dialog.flavor = item;
        },
    },
    created() {
        document.title = "新建实例"
        this.dialog = new NewServerDialog(this.table);
        this.dialog.init();
    },
    watch: {

    },
};
</script>