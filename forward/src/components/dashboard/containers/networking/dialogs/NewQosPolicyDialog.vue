<template>
    <v-dialog v-model="display" width="600">
        <v-card>
            <v-card-title class="headline grey lighten-2" primary-title>新建QOS策略</v-card-title>
            <v-card-text>
                <v-row>
                    <v-col>
                        <v-text-field label="*名字" placeholder="请输入QOS策略名" v-model="dialog.name"></v-text-field>
                    </v-col>
                    <v-col cols="2" class="my-auto"><v-btn text color="primary"
                            @click="dialog.randomName()">随机名字</v-btn>
                    </v-col>
                </v-row>
                <v-text-field label="描述" outlined dense placeholder="请输入描述信息" v-model="dialog.description"></v-text-field>
                <v-switch v-model="dialog.isDefault" label="设为默认" class="my-auto"></v-switch>
                <v-switch v-model="dialog.shared" label="设为共享" class="my-auto"></v-switch>
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
import { NewQosPolicyDialog } from '@/assets/app/dialogs';

export default {
    props: {
        show: Boolean,
    },
    data: () => ({
        i18n: i18n,
        display: false,
        Utils: Utils,
        dialog: new NewQosPolicyDialog(),
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
                this.dialog.init();
            }
        },
        display(newVal) {
            this.display = newVal;
            this.$emit("update:show", this.display);
        }
    },
};
</script>
