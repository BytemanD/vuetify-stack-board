<template>
    <v-dialog scrollable v-model="display" width="1000">
        <v-card>
            <v-card-title class="headline primary lighten-2">
                虚拟机卷管理
                <btn-router-link router-to='/dashboard/storage' text="存储" />
            </v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="12">
                        <v-data-table :headers="dialog.headers" :items="dialog.attachments"
                            class="elevation-2" density='compact' v-model="dialog.selected">
                            <template v-slot:[`item.actions`]="{ item }">
                                <v-btn icon="mdi-close" variant="text" :disabled="item.device == '/dev/vda' || item.device == '/dev/sda'"
                                    color="red" @click="dialog.detach(item)"></v-btn>
                            </template>
                        </v-data-table>
                    </v-col>
                    <v-col cols="10">
                        <v-select multiple chips outlined hide-details :items="dialog.volumes" label="可用卷" item-value="id"
                            :item-props="(item) => {return {title: item.id, subtitle: item.name}}"
                            v-model="dialog.selectedVolumes">
                        </v-select>
                    </v-col>
                    <v-col cols="2" class="my-auto">
                        <v-btn color="primary" @click="dialog.attachSelected()">挂载</v-btn>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>
<script>
import i18n from '@/assets/app/i18n';
import { Utils } from '@/assets/app/lib';
import { ServerVolumeDialog } from '@/assets/app/dialogs';
import BtnRouterLink from '@/components/plugins/BtnRouterLink.vue';


export default {
    props: {
        show: Boolean,
        server: Object,
    },
    components: {
        BtnRouterLink,
    },
    data: () => ({
        i18n: i18n,
        Utils: Utils,
        display: false,
        dialog: new ServerVolumeDialog(),
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