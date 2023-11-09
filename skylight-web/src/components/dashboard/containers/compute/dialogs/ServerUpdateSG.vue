<template>
    <v-dialog v-model="display" width="1000" scrollable>
        <v-card>
            <v-card-title primary-title class="headline primary">更新安全组</v-card-title>
            <v-card-text>
                <h3 class="mt-1">选择端口</h3>
                <v-col>
                    <v-data-table density='compact' show-select class="elevation-1 mt-1" :headers="dialog.interfaceHeaders"
                        :items="dialog.interfaces" :items-per-page="dialog.itemsPerPage"
                        v-model="dialog.selectedInterfaces">
                        <template v-slot:[`item.id`]="{ item }">
                            {{ item.id || item.name }}
                        </template>
                        <template v-slot:[`item.fixed_ips`]="{ item }">
                            <v-chip size="small" v-for="(fixed_ip) in item.fixed_ips" class="mr-2"
                                v-bind:key="fixed_ip.ip_address">{{ fixed_ip.ip_address }}</v-chip>
                        </template>
                    </v-data-table>
                </v-col>
                <v-col>
                    <v-select outlined chips hide-details :items="dialog.securityGroups" label="安全组" item-value="id"
                        :item-props="(item) => { return { title: item.id, subtitle: item.name } }"
                        v-model="dialog.securityGroup" multiple></v-select>
                </v-col>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="commit()" :disabled="dialog.securityGroup.length == 0">更新</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
import i18n from '@/assets/app/i18n';
import { Utils } from '@/assets/app/lib';
import { UpdateServerSG } from '@/assets/app/dialogs';

export default {
    props: {
        show: Boolean,
        server: Object,
    },
    data: () => ({
        i18n: i18n,
        Utils: Utils,
        display: false,
        dialog: new UpdateServerSG(),
    }),
    methods: {
        commit: async function () {
            await this.dialog.commit()
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