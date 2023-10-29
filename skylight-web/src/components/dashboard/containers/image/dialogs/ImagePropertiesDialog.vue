<template>
    <v-dialog v-model="display" width="700">
        <v-card>
            <v-card-title class="headline primary" primary-title>镜像属性</v-card-title>
            <v-card-text>
                <h4>当前属性</h4>
                <v-chip close outlined label color="info" class="mr-4 mt-2"
                    v-for="(value, key, index) in dialog.properties" v-bind:key="index"
                    @click:close="removeProperty(key)">
                    {{ key }}={{ value }}
                </v-chip>
                <v-row>
                    <v-col>
                        <h4>快速添加常用属性</h4>
                        <v-chip label small close close-icon="mdi-plus" class="mr-1 mb-1"
                            v-for="(item, i) in dialog.customizeProperties" v-bind:key="i"
                            @click:close="addProperty(item.key, item.value)">{{ item.key }}={{ item.value }}</v-chip>
                    </v-col>
                    <v-col>
                        <h4>自定义属性</h4>
                        <v-textarea filled label="添加镜像属性" placeholder="请输入镜像属性，例如: hw_qemu_guest_agent=yes"
                            v-model="dialog.propertyContent" persistent-hint hint="自定义属性需以hw_开头,多个属性换行输入。">
                        </v-textarea>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="addProperties()" :disabled="dialog.propertyContent ? false : true">添加</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
import i18n from '@/assets/app/i18n';
import { Utils, MESSAGE } from '@/assets/app/lib';

import { ImagePropertiesDialog } from '@/assets/app/dialogs';


export default {
    props: {
        show: Boolean,
        image: Object,
    },
    data: () => ({
        i18n: i18n,
        Utils: Utils,
        display: false,
        dialog: new ImagePropertiesDialog(),
    }),
    methods: {
        async addProperty(key, value) {
            try {
                await this.dialog.addProperty(key, value);
                this.$emit('completed');
            } catch (error) {
                MESSAGE.error(error.message)
            }
        },
        async addProperties() {
            try {
                await this.dialog.addProperties();
                this.$emit('completed');
            } catch (error) {
                MESSAGE.error(error.message)
            }
        },
        async removeProperty(key) {
            await this.dialog.removeProperty(key);
            this.$emit('completed');
        },

    },
    created() {

    },
    watch: {
        show(newVal) {
            this.display = newVal;
            if (this.display) {
                this.dialog.init(this.image);
            }
        },
        display(newVal) {
            this.display = newVal;
            this.$emit("update:show", this.display);
        }
    },
};
</script>