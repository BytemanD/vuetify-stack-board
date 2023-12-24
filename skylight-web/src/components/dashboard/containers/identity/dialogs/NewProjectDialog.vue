<template>
    <v-dialog v-model="display" width="600">
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" color="primary" icon="mdi-plus"></v-btn>
        </template>
        <v-card>
            <v-card-title class="headline primary lighten-2" primary-title>添加项目</v-card-title>
            <v-card-text>
                <v-text-field label="*名字" placeholder="请输入项目名" v-model="dialog.name"
                    :rules="[dialog.checkNotNull]">
                </v-text-field>
                <template v-slot:append>
                    <v-btn variant="text" color="primary" @click="dialog.refreshName()">随机名字</v-btn>
                </template>
                <v-select density='compact' outlined :items="dialog.domains" label="Domain"
                    :item-props="dialog.itemProps"
                    item-text="name" item-value="id" v-model="dialog.domainId">
                </v-select>
                <v-text-field label="描述" placeholder="请输入描述信息"
                    v-model="dialog.description"></v-text-field>
                <v-switch hide-details class="my-auto" label="启用" v-model="dialog.enabled"></v-switch>
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
import { NewProjectDialog } from '@/assets/app/dialogs';

export default {
    props: {
    },
    data: () => ({
        display: false,
        dialog: new NewProjectDialog(),
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
        }
    },
};
</script>
