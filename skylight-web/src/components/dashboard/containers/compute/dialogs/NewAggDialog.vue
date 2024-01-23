<template>
    <v-dialog v-model="display" width="600">
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon="mdi-plus" fab color="primary" class="mr-1"></v-btn>
        </template>
        <v-card title="新建聚合">
            <template v-slot:append>
                <v-btn color="primary" @click="commit()">创建</v-btn>
            </template>
            <v-card-text>
                <v-row>
                    <v-col class="my-auto">
                        <v-text-field label="名字" placeholder="请输入聚合名" v-model="dialog.name" :error="!dialog.name">
                            <template v-slot:append>
                                <v-btn variant='text' color="primary" @click="dialog.refreshName()">随机名字</v-btn>
                            </template>
                        </v-text-field>
                    </v-col>
                </v-row>
                <v-text-field label="域" placeholder="请输入域名字" v-model="dialog.az"></v-text-field>
            </v-card-text>
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