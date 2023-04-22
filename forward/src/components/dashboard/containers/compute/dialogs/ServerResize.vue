<template>
    <v-dialog v-model="display" width="800">
        <v-card>
            <v-card-title class="headline primary warning" primary-title>规格变更</v-card-title>
            <v-card-text>
                <v-text-field label="当前规格" v-model="dialog.oldFlavorRef" disabled></v-text-field>
                <v-select :items="dialog.flavors" label="选择规格" item-value="id" item-text="name" outlined
                    v-model="dialog.flavorRef">
                </v-select>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="warning" @click="commit()">变更</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
import i18n from '@/assets/app/i18n';
import { MESSAGE, Utils } from '@/assets/app/lib';
import { ResizeDialog } from '@/assets/app/dialogs';

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
        dialog: new ResizeDialog(),
    }),
    methods: {
        commit: async function () {
            if (Utils.isEmpty(this.dialog.flavorRef)){
                MESSAGE.warning('请选择规格!');
                return;
            }
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