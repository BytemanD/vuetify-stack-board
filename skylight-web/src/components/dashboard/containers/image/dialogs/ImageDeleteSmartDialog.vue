<template>
    <v-dialog v-model="display" width="600" persistent>
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon="mdi-trash-can" color="red" :disabled="images.length == 0"></v-btn>
        </template>
        <v-card color="blue-grey-darken-2">
            <v-card-title class="text-red">确定删除镜像?</v-card-title>
            <v-card-text>
                <v-switch v-model="dialog.smart" color="warning" label="智能删除" hide-details></v-switch>
                <v-alert density='compact' color="warning" icon="mdi-alert" variant="text">
                    “智能删除”模式将根据镜像类型自动调整删除的方法,以达到快速删除的目的。
                    <ol>
                        <li>如果是普通镜像，直接删除;</li>
                        <li>如果是实例备份,将首先删除备份,再删除镜像;</li>
                        <li>如果备份状态异常,将会重置备份状态,再删除备份;</li>
                    </ol>
                    <strong class="error--text">请谨慎选择！</strong>
                </v-alert>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-btn color='info' @click="display = false">取消</v-btn>
                <v-spacer></v-spacer>
                <v-btn color="red" @click="commit()">确定</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>

import { ImageDeleteSmartDialog } from '@/assets/app/dialogs';

export default {
    props: {
        images: Array,
    },
    data: () => ({
        display: false,
        dialog: new ImageDeleteSmartDialog(),
    }),
    methods: {
        commit: async function () {
            try {
                await this.dialog.commit(this.images);
                this.display = false;
            } catch (error) {
                console.error(error)
            }
            this.$emit('completed');
        }
    },
    created() {

    },
    watch: {
        display(newVal) {
            this.display = newVal;
            if (this.display) {
                this.dialog.init();
            }
            this.$emit("update:show", this.display);
        }
    },
};
</script>