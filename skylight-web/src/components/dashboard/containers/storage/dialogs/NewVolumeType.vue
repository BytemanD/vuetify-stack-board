<template>
    <v-dialog v-model="display" width="740">
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon="mdi-plus" fab color="primary" class="mr-1"></v-btn>
        </template>

        <v-card>
            <v-card-title class="primary" primary-title>添加卷类型</v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="10">
                        <v-text-field hide-details label="名字" placeholder="请输入卷类型名字" v-model="dialog.name"
                            :rules="[dialog.checkNotNull]"></v-text-field>
                    </v-col>
                    <v-col cols="2" class="my-auto">
                        <v-btn variant="text" color="primary" @click="dialog.refreshName()">随机名字</v-btn>
                    </v-col>
                    <v-col>
                        <v-text-field label="后端名" placeholder="请输入卷类型对应的后端名" v-model="dialog.backendName"></v-text-field>
                        <v-text-field label="描述" placeholder="请输入卷类型描述消息" v-model="dialog.description"
                            hide-details></v-text-field>
                        <v-switch hide-details color="info" v-model="dialog.private" label="私有"></v-switch>
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
import { NewVolumeTypeDialog } from '@/assets/app/dialogs';
import { Utils } from '@/assets/app/lib';

export default {

    data: () => ({
        i18n: i18n,
        Utils: Utils,
        display: false,
        dialog: new NewVolumeTypeDialog(),
    }),
    methods: {
        commit: async function () {
            try {
                await this.dialog.commit()
                this.display = false;
                this.$emit('completed');
            } catch (error) {
                console.error(error)
            }
        }
    },
    created() {

    },
    watch: {
        display(newVal) {
            if (this.display) {
                this.dialog.init();
            }
            this.display = newVal;
            this.$emit("update:show", this.display);
        }
    },
};
</script>