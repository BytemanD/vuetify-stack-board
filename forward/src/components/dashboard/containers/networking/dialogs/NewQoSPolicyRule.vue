<template>
    <v-dialog v-model="display" width="600" scrollable>
        <v-card>
            <v-card-title class="headline primary" primary-title>添加规则</v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="2">
                        <v-checkbox hide-details v-model="dialog.directions" label="出" :value="dialog.EGRESS"></v-checkbox>
                    </v-col>
                    <v-col cols="10">
                        <v-checkbox hide-details v-model="dialog.directions" label="入" :value="dialog.INGRESS"></v-checkbox>
                    </v-col>
                    <v-col cols="6">
                        <v-sheet elevation="2" class="pa-2">
                            <v-checkbox v-model="dialog.types" :label="dialog.BPS" :value="dialog.BPS"></v-checkbox>
                            <v-text-field type="number" label="最大值(kbps)" placeholder="请输入最大值"
                                v-model="dialog.maxKbps"></v-text-field>
                            <v-text-field type="number" label="最大突发值(kbps)" placeholder="请输入最大突发值"
                                v-model="dialog.maxBurstKbps"></v-text-field>
                        </v-sheet>
                    </v-col>
                    <v-col cols="6">
                        <v-sheet elevation="2" class="pa-2">
                            <v-checkbox v-model="dialog.types" :label="dialog.PPS" :value="dialog.PPS"></v-checkbox>
                            <v-text-field type="number" label="最大值(kpps)" placeholder="请输入最大值"
                                v-model="dialog.maxKpps"></v-text-field>
                            <v-text-field type="number" label="最大突发值(kpps)" placeholder="请输入最大突发值"
                                v-model="dialog.maxBurstKpps"></v-text-field>
                        </v-sheet>
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

import { Utils, MESSAGE } from '@/assets/app/lib';
import { NewQosPolicyRule } from '@/assets/app/dialogs';

export default {
    props: {
        show: Boolean, qosPolicy: Object,
    },
    data: () => ({
        i18n: i18n,
        display: false,
        Utils: Utils,
        dialog: new NewQosPolicyRule(),
    }),
    methods: {
        commit: async function () {
            try {
                await this.dialog.commit()
                this.display = false;
                this.$emit('completed');
            } catch (error){
                MESSAGE.error(error.message);
            }
        }
    },
    created() {

    },
    watch: {
        show(newVal) {
            this.display = newVal;
            if (this.display) {
                this.dialog.init(this.qosPolicy);
            }
        },
        display(newVal) {
            this.display = newVal;
            this.$emit("update:show", this.display);
        }
    },
};
</script>
