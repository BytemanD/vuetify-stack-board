<template>
    <v-dialog v-model="display" width="800">
        <v-card>
            <v-card-title class="headline warning" primary-title>虚拟机重建</v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="12">
                        <v-text-field label="描述" v-model="dialog.description"></v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-select dense clearable :items="dialog.images" label="镜像" item-value="id" item-text="name"
                            outlined v-model="dialog.imageRef">
                        </v-select>
                    </v-col>
                </v-row>
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
    },
    data: () => ({
        i18n: i18n,
        Utils: Utils,
        display: false,
        dialog: new RebuildDialog(),
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