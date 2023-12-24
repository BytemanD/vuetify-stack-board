<template>
    <v-dialog v-model="display" width="600">
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon="mdi-plus" fab color="primary" class="mr-1"></v-btn>
        </template>
        <v-card>
            <v-card-title class="headline primary lighten-2" primary-title>新建QOS策略</v-card-title>
            <v-card-text>
                <v-text-field label="*名字" placeholder="请输入QOS策略名" v-model="dialog.name">
                    <template v-slot:append>
                        <v-btn variant="text" color="primary" @click="dialog.randomName()">随机名字</v-btn>
                    </template>
                </v-text-field>
                <v-text-field label="描述" outlined density='compact' placeholder="请输入描述信息"
                    v-model="dialog.description"></v-text-field>
                <v-switch hide-details v-model="dialog.isDefault" label="设为默认"></v-switch>
                <v-switch  hide-details v-model="dialog.shared" label="设为共享"></v-switch>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="flat" color="primary" @click="commit()">创建</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
import i18n from '@/assets/app/i18n';
import { Utils } from '@/assets/app/lib';
import { NewQosPolicyDialog } from '@/assets/app/dialogs';

export default {
    props: {
    },
    data: () => ({
        i18n: i18n,
        display: false,
        Utils: Utils,
        dialog: new NewQosPolicyDialog(),
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
