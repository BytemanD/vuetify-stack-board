<template>
    <v-dialog v-model="display" width="600" scrollable>
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon="mdi-plus" fab color="primary" class="mr-1"></v-btn>
        </template>
        <v-card>
            <v-card-title class="headline primary lighten-2" primary-title>新建安全组</v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="10">
                        <v-text-field label="*名字" placeholder="请输入安全组名" v-model="dialog.name"></v-text-field>
                    </v-col>
                    <v-col cols="2" class="my-auto">
                        <v-btn variant="text" color="primary" @click="dialog.refreshName()">随机名字</v-btn>
                    </v-col>
                    <v-col cols="12">
                        <v-text-field hide-details label="描述" outlined density='compact' placeholder="请输入描述信息"
                            v-model="dialog.description"></v-text-field>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="flat" color="primary" @click="commit()">创建</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
import i18n from '@/assets/app/i18n';
import { Utils } from '@/assets/app/lib';
import { NewSGDialog } from '@/assets/app/dialogs';
import notify from '@/assets/app/notify';

export default {
    props: {
    },
    data: () => ({
        i18n: i18n,
        display: false,
        Utils: Utils,
        dialog: new NewSGDialog(),
    }),
    methods: {
        commit: async function () {
            notify.info(`开始创建 ${this.dialog.name}`)
            await this.dialog.commit()
            this.display = false;
            this.$emit('completed');
        }
    },
    created() {

    },
    watch: {
        display(newVal) {
            if (this.display) {
                this.dialog.init(this.network);
            }
            this.display = newVal;
            this.$emit("update:show", this.display);
        }
    },
};
</script>
