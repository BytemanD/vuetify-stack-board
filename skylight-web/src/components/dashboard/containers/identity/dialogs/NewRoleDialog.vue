<template>
    <v-dialog v-model="display" width="600">
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon="mdi-plus" fab color="primary" class="mr-1"></v-btn>
        </template>
        <v-card>
            <v-card-title class="headline primary" primary-title>添加角色</v-card-title>
            <v-card-text>
                <br>
                <v-text-field label="*名字" placeholder="请输入角色名" v-model="dialog.name"></v-text-field>
                <v-select :items="dialog.domains" clearable label="Domain" item-text="name" item-value="id"
                    density='compact' outlined v-model="dialog.domainId">
                </v-select>
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
import { MESSAGE } from '@/assets/app/lib';

import { NewRoleDialog } from '@/assets/app/dialogs';


export default {
    props: {
        show: Boolean,
    },
    data: () => ({
        display: false,
        dialog: new NewRoleDialog(),
    }),
    methods: {
        commit: async function () {
            try {
                await this.dialog.commit()
                this.display = false;
                this.$emit('completed');
            } catch (error) {
                MESSAGE.error(error.message);
            }
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
