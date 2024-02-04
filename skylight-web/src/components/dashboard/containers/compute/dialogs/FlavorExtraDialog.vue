<template>
    <v-dialog v-model="display" width="800" scrollable>
        <v-card>
            <v-card-title class="headline primary" primary-title>规格属性</v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="6">
                        <h4>属性</h4>
                        <v-chip label size="small" closable class="mr-1 mt-1 info" v-for="(value, key) in dialog.extraSpecs"
                            v-bind:key="key" @click:close="deleteExtra(key)">{{ key }}={{ value }}</v-chip>
                    </v-col>
                    <v-col cols="6">
                        <h4>快速添加常用属性</h4>
                        <v-chip label size="small" closable close-icon="mdi-plus" class="mr-1 mb-1"
                            v-for="item in dialog.customizeExtras" v-bind:key="item.key"
                            @click:close="addExtra(item)">{{ item.key }}={{ item.value }}
                        </v-chip>
                    </v-col>
                    <v-col cols="10">
                        <v-textarea hide-details filled label="自定义属性"
                            placeholder="请输入规格的属性,例如: hw:page_size=large, 多个属性换行输入。"
                            v-model="dialog.newExtraSpecs"></v-textarea>
                    </v-col>
                    <v-col cols="2">
                        <v-btn color="primary"  @click="addNewExtraSpecs()">添加</v-btn>
                    </v-col>
                    <br>
                </v-row>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>
<script>
import i18n from '@/assets/app/i18n';
import { Utils } from '@/assets/app/lib';

import { FlavorExtraDialog } from '@/assets/app/dialogs';


export default {
    components: {
    },
    props: {
        show: Boolean,
        flavor: Object,
    },
    data: () => ({
        i18n: i18n,
        Utils: Utils,
        display: false,
        dialog: new FlavorExtraDialog(),
    }),
    methods: {
        addExtra(item){
            this.dialog.addExtra(item);
            this.$emit('completed');
        },
        deleteExtra(key) {
            this.dialog.deleteExtra(key);
            this.$emit('completed');
        },
        addNewExtraSpecs() {
            this.dialog.addNewExtraSpecs();
            this.$emit('completed');
        }
    },
    created() {

    },
    watch: {
        show(newVal) {
            this.display = newVal;
            if (this.display) {
                this.dialog.init(this.flavor);
            }
        },
        display(newVal) {
            this.display = newVal;
            this.$emit("update:show", this.display);
        }
    },
};
</script>