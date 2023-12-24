<template>
    <v-dialog v-model="display" width="800">
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon="mdi-plus" fab color="primary" class="mr-1"></v-btn>
        </template>
        <v-card>
            <v-card-title class="headline primary lighten-2" primary-title>新建网络</v-card-title>
            <v-card-text>
                <v-row>
                    <v-col>
                        <v-text-field label="*名字" placeholder="请输入网络名" v-model="dialog.name">
                        <template v-slot:append>
                            <v-btn variant="text" color="primary" @click="dialog.refreshName()">随机名字</v-btn>
                        </template>
                        </v-text-field>
                    </v-col>
                 </v-row>
                <v-row>
                    <v-col cols="6">
                        <v-select density='compact' outlined hide-details :items="dialog.netTypes" clearable label="网络类型"
                            v-model="dialog.params.networkType">
                        </v-select>
                    </v-col>
                    <v-col cols="6">
                        <v-switch v-model="dialog.params.shared" label="共享" hidde-details class="my-auto"></v-switch>
                    </v-col>
                    <v-col cols="6">
                        <v-text-field hide-details label="Segment ID" placeholder="请输入segment ID"
                            v-model="dialog.params.segId" density='compact' outlined></v-text-field>
                    </v-col>
                    <v-col cols="6">
                        <v-text-field hide-details label="dnsDomain" placeholder="请输入dnsDomain"
                            v-model="dialog.params.dnsDomain" density='compact' outlined> </v-text-field>
                    </v-col>
                    <v-col cols="6">
                        <v-text-field hide-details label="azHint" placeholder="请输入azHint" v-model="dialog.params.azHint"
                            density='compact' outlined> </v-text-field>
                    </v-col>
                    <v-col cols="6">
                        <v-select :items="dialog.qosPolices" clearable label="QoS规则" density='compact' outlined
                            v-model="dialog.params.qosPolicy">
                        </v-select>
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
import { NewNetworkDialog } from '@/assets/app/dialogs';
import { Utils } from '@/assets/app/lib';

export default {
    props: {
        show: Boolean,
    },
    data: () => ({
        i18n: i18n,
        display: false,
        dialog: new NewNetworkDialog(),
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
        display(newVal) {
            if (this.display){
                this.dialog.init();
            }
        }
    },
};
</script>
