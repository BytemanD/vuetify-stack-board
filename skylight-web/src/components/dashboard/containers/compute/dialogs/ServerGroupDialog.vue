<template>
    <v-dialog v-model="display" width="600" scrollable>
        <v-card>
            <v-card-title primary-title class="headline primary">虚拟机群组</v-card-title>
            <v-card-text>
                <table>
                    <tr>
                        <td class="text-info">ID:</td>
                        <td>{{ dialog.serverGroup.id }}</td>
                    </tr>
                    <tr>
                        <td class="text-info">名字:</td>
                        <td>{{ dialog.serverGroup.name }}</td>
                    </tr>
                    <tr>
                        <td class="text-info">策略:</td>
                        <td>
                            <v-chip label small class="mr-1 info" v-for="policy in dialog.serverGroup.policies"
                                v-bind:key="policy">{{ policy }}</v-chip>
                        </td>
                    </tr>
                    <tr>
                        <td class="text-info">成员:</td>
                        <td>
                            <v-chip label small class="mr-1" v-for="member in dialog.serverGroup.members"
                                v-bind:key="member">{{ member }}</v-chip>
                        </td>
                    </tr>
                </table>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>
<script>
import i18n from '@/assets/app/i18n';
import { Utils } from '@/assets/app/lib';

import { ServerGroupDialog } from '@/assets/app/dialogs';

export default {
    components: {

    },
    props: {
        show: Boolean,
        server: Object,
    },
    data: () => ({
        i18n: i18n,
        Utils: Utils,
        display: false,
        dialog: new ServerGroupDialog(),
    }),
    methods: {

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