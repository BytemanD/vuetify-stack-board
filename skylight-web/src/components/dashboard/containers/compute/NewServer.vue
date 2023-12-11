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
                            <v-text-field placeholder="请输入实例名" v-model="dialog.params.name" :error="!dialog.params.name"
                                :rules="[dialog.checkNotNull]" density="compact" hide-details>
                                <template v-slot:prepend>名字</template>
                                <template v-slot:append>
                                    <v-btn class="my-auto" color="info" variant="text"
                                        @click="dialog.params.name = Utils.getRandomName('server')">随机名字</v-btn>
                                </template>
                            </v-text-field>
                        </v-col>
                        <v-col cols="10" class="mt-0">
                            <v-data-table density='compact' :headers="dialog.imageHeaders" :items="dialog.images"
                                items-per-page="5" :search="imageSearch">
                                <template v-slot:[`item.id`]="{ item }">
                                    <v-chip variant="text" density="compact"
                                        :color="item.id == selectedImage.id ? 'info' : ''" @click="selectImage(item)">{{
                                            item.id }}</v-chip>
                                </template>
                                <template v-slot:top>
                                    <v-row>
                                        <v-col cols="6">
                                            <v-text-field density="compact" readonly hide-details v-model="selectedImage.id"
                                                :label="selectedImage.name">
                                                <template v-slot:prepend>镜像</template>
                                            </v-text-field>
                                        </v-col>
                                        <v-col cols="6">
                                            <v-text-field density='compact' v-model="imageSearch" placeholder="搜索"
                                                hide-details></v-text-field>
                                        </v-col>
                                    </v-row>
                                </template>
                            </v-data-table>
                        </v-col>
                        <v-col cols="12" md="6" lg="6">
                            <v-select :items="dialog.flavors" density='compact' item-value="id"
                                :item-props="dialog.itemProps" v-model="dialog.params.flavor"
                                :error="!dialog.params.flavor">
                                <template v-slot:prepend>规格</template>
                            </v-select>
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
                            <v-switch v-model="dialog.useBdm" color="info" class="my-auto" hide-details>
                                <template v-slot:prepend>创建卷</template>
                            </v-switch>
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
        dialog: {},
        selectedImage: {},
        imageSearch: null,
    }),
    methods: {
        selectImage: function (item) {
            this.selectedImage = item;
            this.dialog.params.image = this.selectedImage.id;
        }
    },
    created() {
        this.dialog = new NewServerDialog(this.table);
        this.dialog.init();
    },
    watch: {

    },
};
</script>