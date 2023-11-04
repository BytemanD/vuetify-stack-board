<template>
    <v-dialog v-model="display" width="500">
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" color="purple" text @click="openNewClusterDialog = true">添加集群</v-btn>
        </template>
        <v-card>
            <v-card-title class="headline primary lighten-2">新建集群</v-card-title>
            <v-card-text>
                <v-col>
                    <v-text-field density="compact" placeholder="请输入环境名" v-model="dialog.name">
                        <template v-slot:prepend>
                            <p class="text-info">环境</p>
                        </template>
                    </v-text-field>
                    <v-text-field density="compact" label="" placeholder="例如: http://keystone-server:5000"
                        v-model="dialog.authUrl">
                        <template v-slot:prepend>
                            <p class="text-info">认证</p>
                        </template>
                    </v-text-field>
                    <v-text-field density="compact" label="" placeholder="请输入租户名" v-model="dialog.authProject">
                        <template v-slot:prepend>
                            <p class="text-info">租户</p>
                        </template>
                    </v-text-field>
                    <v-text-field density="compact" label="" placeholder="请输入用户名" v-model="dialog.authUser">
                        <template v-slot:prepend>
                            <p class="text-info">用户</p>
                        </template>
                    </v-text-field>
                    <v-text-field density="compact" label="" placeholder="请输入密码" v-model="dialog.authPassword"
                        :append-icon="dialog.hidePassword ? 'mdi-eye-off' : 'mdi-eye'"
                        :type="dialog.hidePassword ? 'password' : 'text'"
                        @click:append="dialog.hidePassword = !dialog.hidePassword">
                        <template v-slot:prepend>
                            <p class="text-info">密码</p>
                        </template>
                    </v-text-field>
                </v-col>
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
import { NewClusterDialog } from '@/assets/app/dialogs';
import { MESSAGE } from '@/assets/app/lib.js';

export default {
    props: {
    },
    data: () => ({
        display: false,
        dialog: new NewClusterDialog(),
    }),
    methods: {
        commit: async function () {
            try {
                await this.dialog.commit();
            } catch (e) {
                MESSAGE.error(e);
                return;
            }
            this.display = false;
            this.$emit('completed');
        }
    },
    created() {
    },
    watch: {
        display(newVal) {
            this.display = newVal;
            this.$emit("update:show", this.display);
        }
    },
};
</script>