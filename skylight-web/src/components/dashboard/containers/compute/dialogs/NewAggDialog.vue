<template>
    <v-dialog v-model="display" width="600">
        <v-card>
            <v-card-title class="headline primary lighten-2" primary-title>新建聚合</v-card-title>
            <v-card-text>
                <v-row>
                    <v-col class="my-auto">
                        <v-text-field label="*名字" placeholder="请输入聚合名" v-model="dialog.name"
                            :error="!dialog.name"></v-text-field>
                    </v-col>
                    <v-col cols="2" class="my-auto">
                        <v-btn text color="primary" @click="dialog.refreshName()">随机名字</v-btn>
                    </v-col>
                </v-row>
                <v-text-field label="域" placeholder="请输入域名字" v-model="dialog.az"></v-text-field>
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
import { NewAggDialog } from '@/assets/app/dialogs';

export default {
    props: {
        show: Boolean,
    },
    data: () => ({
        i18n: i18n,
        display: false,
        dialog: new NewAggDialog(),
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