<template>
    <v-dialog v-model="display" width="500">
        <v-card>
            <v-card-title class="headline warning lighten-2" primary-title>修改实例密码</v-card-title>
            <v-card-text>
                <v-col><v-text-field hide-details label="新密码" placeholder="请输入新密码"
                        v-model="dialog.password"></v-text-field></v-col>
                <v-col><v-text-field hide-details label="用户名" placeholder="请输入实例用户名(例如: root)"
                        v-model="dialog.userName"></v-text-field></v-col>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="warning" @click="commit()"
                    :disabled="dialog.password == ''">修改</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
import i18n from '@/assets/app/i18n';
import { Utils } from '@/assets/app/lib';
import { ChangePasswordDialog } from '@/assets/app/dialogs';

export default {
    props: {
        show: Boolean,
        server: Object,
    },
    data: () => ({
        i18n: i18n,
        Utils: Utils,
        display: false,
        dialog: new ChangePasswordDialog(),
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
                this.dialog.init(this.server);
            }
        },
        display(newVal) {
            this.display = newVal;
            this.$emit("update:show", this.display);
        }
    },
};
</script>