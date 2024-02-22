<template>
    <v-dialog v-model="display" width="600">
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon="mdi-plus" fab color="primary" class="mr-1"></v-btn>
        </template>
        <v-card>
            <v-card-title class="primary" primary-title>新建Endpoint</v-card-title>
            <v-card-text>
                <v-select :items="dialog.services" label="服务名" item-title="name" item-value="id" v-model="dialog.service"
                    :error="!dialog.service">
                </v-select>
                <v-text-field label="Region" placeholder="请输入Region" v-model="dialog.region" :error="!dialog.region">
                </v-text-field>
                <v-text-field label="URL" placeholder="请输入URL,例如: http://service:8080/v2" v-model="dialog.url"
                    :error="!dialog.url">
                </v-text-field>
                <v-combobox v-model="dialog.interfaces" :items="dialog.INTERFACES" label="接口类型" chips multiple></v-combobox>
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
import { NewEndpoingDialog } from '@/assets/app/dialogs';

export default {
    props: {
    },
    data: () => ({
        i18n: i18n,
        display: false,
        Utils: Utils,
        dialog: new NewEndpoingDialog(),
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
