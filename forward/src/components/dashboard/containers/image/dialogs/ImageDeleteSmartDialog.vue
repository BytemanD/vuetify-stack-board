<template>
    <v-dialog v-model="display" width="600">
        <v-card>
            <v-card-title class="warning" primary-title>删除镜像</v-card-title>
            <v-card-text>
                <v-switch v-model="dialog.smart" label="智能删除"></v-switch>
                <v-alert text dense color="warning" icon="mdi-alert">
                    “智能删除”模式将根据镜像类型自动调整删除的方法,以达到快速删除的目的。
                    <ol>
                        <li>如果是普通镜像，直接删除;</li>
                        <li>如果是实例备份,将首先删除备份,再删除镜像;</li>
                        <li>如果备份状态异常,将会重置备份状态,再删除备份;</li>
                    </ol>
                    <strong class="error--text">请谨慎操作！</strong>
                </v-alert>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error" @click="commit()">删除</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
import i18n from '@/assets/app/i18n';
import { Utils } from '@/assets/app/lib';
import { ImageDeleteSmartDialog } from '@/assets/app/dialogs';

export default {
    props: {
        show: Boolean,
        images: Array,
    },
    data: () => ({
        i18n: i18n,
        Utils: Utils,
        display: false,
        dialog: new ImageDeleteSmartDialog(),
    }),
    methods: {
        commit: async function () {
            try {
                await this.dialog.commit(this.images);
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