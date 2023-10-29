<template>
    <v-dialog scrollable v-model="display" width="900">
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" color="primary" variant="text">{{ $t('region') }}</v-btn>
        </template>
        <v-card>
            <v-card-title>Region管理</v-card-title>
            <v-card-text>
                <v-row>
                    <v-col>
                        <!-- TODO -->
                        <v-btn icon="mdi-plus" variant="text" color="primary"></v-btn>
                        <v-btn color="red" icon="mdi-trash-can" variant="text" @click="dialog.regionTable.deleteSelected()"></v-btn>
                    </v-col>
                    <v-col>
                        <v-text-field density='compact' single-line hide-details small v-model="dialog.regionTable.search"
                            label="搜索"></v-text-field>
                    </v-col>
                    <v-col cols="1">
                        <v-btn fab x-small color="info"
                            v-on:click="dialog.regionTable.refresh()"><v-icon>mdi-refresh</v-icon></v-btn>
                    </v-col>
                </v-row>
                <v-data-table density='compact' show-select :loading="dialog.regionTable.loading"
                    :headers="dialog.regionTable.headers" :items="dialog.regionTable.items"
                    :items-per-page="dialog.regionTable.itemsPerPage" :search="dialog.regionTable.search"
                    v-model="dialog.regionTable.selected">
                </v-data-table>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
import i18n from '@/assets/app/i18n';
import { Utils } from '@/assets/app/lib';
import { RegionDialog } from '@/assets/app/dialogs';

export default {
    props: {
    },
    data: () => ({
        i18n: i18n,
        display: false,
        Utils: Utils,
        dialog: new RegionDialog(),
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
