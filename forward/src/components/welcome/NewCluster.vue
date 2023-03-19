<template>
    <v-dialog v-model="display" width="500">
        <v-card>
            <!-- <v-card-title class="  " primary-title>添加环境</v-card-title> -->
            <br>
            <v-card-text>
                <v-text-field label="*环境名" placeholder="请输入环境名" v-model="dialog.params.name"></v-text-field>
                <v-text-field hide-details label="*认证地址" placeholder="例如：http://keystone-server:5000"
                    v-model="dialog.params.authUrl"></v-text-field>
                <v-text-field hide-details label="*租户名" placeholder="请输入租户名"
                    v-model="dialog.params.authProject"></v-text-field>
                <v-text-field hide-details label="*用户名" placeholder="请输入用户名"
                    v-model="dialog.params.authUser"></v-text-field>
                <v-text-field hide-details label="*密码" placeholder="请输入密码" v-model="dialog.params.authPassword"
                    :append-icon="dialog.hidePassword ? 'mdi-eye-off' : 'mdi-eye'"
                    :type="dialog.hidePassword ? 'password' : 'text'"
                    @click:append="dialog.hidePassword = !dialog.hidePassword">
                </v-text-field>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="commit()">添加</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
import i18n from '@/assets/app/i18n';
import { NewClusterDialog } from '@/assets/app/dialogs';

export default {
    props: {
        show: Boolean,
    },
    data: () => ({
        i18n: i18n,
        display: false,
        dialog: new NewClusterDialog(),
    }),
    methods: {
        commit: async function () {
            await this.dialog.commit();
            this.display = false;
            this.$emit('completed');
        }
    },
    created() {

    },
    watch: {
        show(newVal) {
            this.display = newVal;
        },
        display(newVal) {
            this.display = newVal;
            this.$emit("update:show", this.display);
        }
    },
};
</script>