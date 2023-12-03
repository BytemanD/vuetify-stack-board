<template>
    <v-dialog v-model="display" width="800" scrollable>
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon="mdi-plus" fab color="primary" class="mr-1"></v-btn>
        </template>
        <v-card>
            <v-card-title class="headline primary" primary-title>新建密钥对</v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="10">
                        <v-text-field hide-details label="名字" placeholder="请输入密钥对名"
                            v-model="dialog.newKeypair.name"></v-text-field>
                    </v-col>
                    <v-col cols="2" class="my-auto">
                        <v-btn text color="primary" @click="dialog.randomName(); dialog.privateKey = ''">随机名字</v-btn>
                    </v-col>
                    <v-col cols="4">
                        <v-select density='compact' outlined hide-details :items="dialog.keyTypes" label="类型"
                            v-model="dialog.newKeypair.type">
                        </v-select>
                    </v-col>
                    <v-col cols="12">
                        <v-textarea hide-details filled readonly label="私钥内容" v-model="dialog.privateKey"></v-textarea>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer><v-btn color="primary" @click="commit()">创建</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
import i18n from '@/assets/app/i18n';
import { NewKeypairDialog } from '@/assets/app/dialogs';
import { Utils } from '@/assets/app/lib';

export default {
    props: {
    },
    data: () => ({
        i18n: i18n,
        Utils: Utils,
        display: false,
        dialog: new NewKeypairDialog(),
    }),
    methods: {
        commit: async function () {
            await this.dialog.commit();
            this.$emit('completed');
        }
    },
    watch: {
        display(newVal) {
            if (this.display) {
                this.dialog.open();
            }
            this.display = newVal;
            this.$emit("update:show", this.display);
        }
    },
};
</script>