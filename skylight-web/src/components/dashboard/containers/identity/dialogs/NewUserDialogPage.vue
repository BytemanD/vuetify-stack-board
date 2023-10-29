<template>
    <v-dialog v-model="display" width="600">
        <v-card>
            <v-card-title class="headline primary lighten-2" primary-title>添加用户</v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="10">
                        <v-text-field label="名字" placeholder="请输入用户名" v-model="dialog.name"
                            :rules="[dialog.checkNotNull]"></v-text-field>
                    </v-col>
                    <v-col cols="2" class="my-auto">
                        <v-btn text color="primary" @click="dialog.randomName()">随机名字</v-btn>
                    </v-col>
                </v-row>
                <v-text-field label="密码" placeholder="请输入密码" v-model="dialog.password"></v-text-field>
                <v-select clearable :items="dialog.roles" label="角色" item-text="name" item-value="id" density='compact' outlined
                    v-model="dialog.userRole" :rules="[dialog.checkUserRole]">
                </v-select>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="dialog.commit()">创建</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import { NewUserDialog } from '@/assets/app/dialogs';

export default {
    props: {
        show: Boolean,
        project: Object
    },
    data: () => ({
        display: false,
        dialog: new NewUserDialog(),
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
                this.dialog.init(this.project);
            }
        },
        display(newVal) {
            this.display = newVal;
            this.$emit("update:show", this.display);
        }
    },
};
</script>
