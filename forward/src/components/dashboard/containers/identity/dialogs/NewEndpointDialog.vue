<template>
    <v-dialog v-model="display" width="600">
        <v-card>
            <v-card-title class="headline grey lighten-2" primary-title>新建Endpoint</v-card-title>
            <v-card-text>
                <v-select :items="dialog.services" label="服务名" item-text="name" item-value="id"
                    v-model="dialog.service" :error="!dialog.service">
                </v-select>
                <v-text-field label="Region" placeholder="请输入Region" v-model="dialog.region" :error="!dialog.region">
                </v-text-field>
                <v-text-field label="URL" placeholder="请输入URL,例如: service:1111/v2" v-model="dialog.url"
                    :error="!dialog.url">
                    <v-select hide-details dense slot="prepend" :items="dialog.SCHEMAS" v-model="dialog.schema"></v-select>
                </v-text-field>
                <strong> 接口类型:</strong>
                <v-btn-toggle multiple small color="info" v-model="dialog.interfaces">
                    <v-btn small v-for="item in dialog.INTERFACES" v-bind:key="item">{{item}}</v-btn>
                </v-btn-toggle>
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
        show: Boolean,
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
