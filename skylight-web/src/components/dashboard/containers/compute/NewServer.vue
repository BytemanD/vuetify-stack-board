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
            <v-btn @click="dialog.commit()" color="primary">创建</v-btn>
        </v-col>
        <v-col cols="12" class="mt-0 pt-0" style="zoom: 0.9;">
            <v-stepper :items="['基本设置', '安全', '自定义']" editable hide-actions>
                <template v-slot:item.1>
                    <v-row>
                        <v-col cols="6">
                            <v-text-field placeholder="请输入实例名" v-model="dialog.name" :error="!dialog.name"
                                :messages="dialog.validName()" density="compact" hide-details>
                                <template v-slot:prepend>名字</template>
                                <template v-slot:append>
                                    <v-btn class="my-auto" color="info" variant="text"
                                        @click="dialog.name = Utils.getRandomName('server')">随机名字</v-btn>
                                </template>
                            </v-text-field>
                        </v-col>
                        <v-col cols="9" class="mt-0">
                            <v-text-field class="mb-1" density="compact" readonly v-model="dialog.image.id"
                                :label="dialog.image.name" :error="!dialog.image.id"
                                :messages="dialog.validImage()">
                                <template v-slot:prepend>镜像</template>
                            </v-text-field>
                            <image-table class="ml-10" @select-image="(image) => { selectImage(image) }" />
                        </v-col>
                        <v-col cols="9" class="mt-0">
                            <v-text-field class="mb-1" density="compact" readonly v-model="dialog.flavor.id"
                                :label="dialog.flavor.name" :error="!dialog.flavor.id"
                                :messages="dialog.validFlavor()">
                                <template v-slot:prepend>规格</template>
                            </v-text-field>
                            <flavor-table class="ml-10" @select-flavor="(flavor) => { selectFlavor(flavor) }" />
                        </v-col>
                        <v-col cols="12" md="6" lg="6">
                            <v-select :items="dialog.networks" clearable density='compact' :item-props="dialog.itemProps"
                                item-value="id" v-model="dialog.params.netId" @click="dialog.refresNetworks()">
                                <template v-slot:prepend>网络</template>
                            </v-select>
                            <v-select clearable density='compact' :items="dialog.ports" :item-props="dialog.itemProps"
                                item-value="id" messages="如果选择端口，只能创建一台虚拟机。" v-model="dialog.portId"
                                @click="dialog.refresPorts()">
                                <template v-slot:prepend>端口</template>
                            </v-select>
                        </v-col>
                        <v-col cols="12" md="6" lg="6">
                            <v-checkbox hide-details v-model="dialog.useBdm" color="info" class="my-auto"
                                label="创建卷"></v-checkbox>
                            <v-select :disabled="!dialog.useBdm" :items="dialog.volumeTypes" clearable density='compact'
                                item-title="name" item-value="name" @click="dialog.refreshVolumeTypes()"
                                v-model="dialog.volumeType">
                                <template v-slot:prepend>卷类型</template>
                            </v-select>
                            <v-slider :disabled="!dialog.useBdm" v-model="dialog.volumeSize" color="info"
                                show-ticks="always" tick-size="4" :min="dialog.volumeSizeMin" max="100" step="10">
                                <template v-slot:prepend>卷大小</template>
                                <template v-slot:append><v-chip label small>{{ dialog.volumeSize }} GB</v-chip></template>
                            </v-slider>
                        </v-col>
                    </v-row>
                </template>

                <template v-slot:item.2>
                    <v-row>
                        <v-col>
                            <v-select :items="dialog.securityGroups" clearable :item-props="dialog.itemProps"
                                item-value="id" v-model="dialog.securityGroup" persistent-hint hint="只能选择当前租户的安全组"
                                @click="dialog.refreshSecurityGroups()">
                                <template v-slot:prepend>安全组</template>
                            </v-select>
                            <v-text-field placeholder="请输入实例密码" v-model="dialog.params.password">
                                <template v-slot:prepend>密码</template>
                            </v-text-field>
                            <v-select :items="dialog.keypairs" clearable item-title="keypair.name" item-value="keypair.name"
                                v-model="dialog.keypair" @click="dialog.refreshKeypairs()">
                                <template v-slot:prepend>密钥对</template>
                            </v-select>
                        </v-col>
                        <v-col>
                        </v-col>
                    </v-row>
                </template>

                <template v-slot:item.3>
                    <v-row>
                        <v-col cols="6">
                            <v-text-field density='compact' placeholder="请输入描述信息" v-model="dialog.description">
                                <template v-slot:prepend>描述</template>
                            </v-text-field>
                            <v-select density='compact' :items="dialog.azList" clearable placeholder="请选择AZ"
                                item-title="zoneName" v-model="dialog.params.az" @click="dialog.refreshAzList()">
                                <template v-slot:prepend>AZ</template>
                            </v-select>
                            <v-select density='compact' :disabled="!dialog.params.az"
                                :items="dialog.azHosts[dialog.params.az]" clearable placeholder="请选择节点"
                                v-model="dialog.params.host" item-value="value" item-title="title">
                                <template v-slot:prepend>节点</template>
                            </v-select>
                        </v-col>

                        <v-col lg="6">
                        </v-col>
                        <v-col lg="12">
                            <v-range-slider v-model="dialog.params.nums" label="实例数量" max="20" min="1" step="1"
                                show-ticks="always" tick-size="4" color="info" hide-details strict>
                                <template v-slot:prepend><v-chip label small>{{ dialog.params.nums[0] }}</v-chip></template>
                                <template v-slot:append><v-chip label small>{{ dialog.params.nums[1] }}</v-chip></template>
                            </v-range-slider>
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

import ImageTable from '@/components/plugins/tables/ImageTable.vue';
import FlavorTable from '@/components/plugins/tables/FlavorTable.vue';

export default {
    components: {
        ImageTable, FlavorTable,
    },
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
        this.dialog = new NewServerDialog(this.table);
        this.dialog.init();
    },
    watch: {

    },
};
</script>