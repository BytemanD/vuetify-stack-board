<template>
    <v-dialog v-model="display" width="600">
        <v-card>
            <v-card-title class="headline warning" primary-title>虚拟机重建</v-card-title>
            <v-card-text>
                <v-select density='compact' clearable :items="dialog.images" label="镜像" item-value="id"
                    :item-props="(item) => { return { title: item.id, subtitle: item.name } }" outlined
                    v-model="dialog.imageRef">
                </v-select>
                <v-text-field density="compact" label="密码" clearable placeholder="请输入密码" v-model="dialog.password"
                    :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="showPassword ? 'text' : 'password'" @click:append="showPassword = !showPassword">
                </v-text-field>
                <v-text-field label="描述" v-model="dialog.description"></v-text-field>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="warning" @click="commit()">重建</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
import i18n from '@/assets/app/i18n';
import { Utils } from '@/assets/app/lib';
import { RebuildDialog } from '@/assets/app/dialogs';

export default {
    props: {
        show: Boolean,
        server: Object,
        serverTable: Object,
    },
    data: () => ({
        i18n: i18n,
        Utils: Utils,
        display: false,
        dialog: new RebuildDialog(),
        showPassword: false,
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
            if (this.display) {
                this.dialog.init(this.server, this.serverTable);
            }
        },
        display(newVal) {
            this.display = newVal;
            this.$emit("update:show", this.display);
        }
    },
};
</script>