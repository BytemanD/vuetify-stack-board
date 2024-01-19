<template>
    <v-dialog v-model="display" width="500" scrollable>
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" variant="text" density="compact" icon="mdi-plus"
                @click="openNewClusterDialog = true"></v-btn>
        </template>
        <v-card>
            <v-card-title class="headline primary lighten-2">添加集群</v-card-title>
            <v-card-text>
                <v-col>
                    <v-text-field density="compact" placeholder="请输入环境名" v-model="dialog.name">
                        <template v-slot:prepend>
                            <span class="text-info">环境</span>
                        </template>
                    </v-text-field>
                    <v-text-field density="compact" placeholder="例如: http://keystone-server:5000" v-model="dialog.authUrl">
                        <template v-slot:prepend>
                            <span class="text-info">入口</span>
                        </template>
                    </v-text-field>
                    <v-text-field density="compact" placeholder="请输入租户名" v-model="dialog.authProject">
                        <template v-slot:prepend>
                            <span class="text-info">租户</span>
                        </template>
                    </v-text-field>
                    <v-text-field density="compact" placeholder="请输入用户名" v-model="dialog.authUser">
                        <template v-slot:prepend>
                            <span class="text-info">用户</span>
                        </template>
                    </v-text-field>
                    <v-text-field density="compact" placeholder="请输入密码" v-model="dialog.authPassword"
                        :append-inner-icon="dialog.hidePassword ? 'mdi-eye-off' : 'mdi-eye'"
                        :type="dialog.hidePassword ? 'password' : 'text'"
                        @click:append-inner="dialog.hidePassword = !dialog.hidePassword">
                        <template v-slot:prepend>
                            <span class="text-info">密码</span>
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
import notify from '@/assets/app/notify';

export default {
    data: () => ({
        display: false,
        dialog: new NewClusterDialog(),
    }),
    methods: {
        commit: async function () {
            try {
                await this.dialog.commit();
            } catch (e) {
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