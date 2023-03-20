<template>
<v-dialog scrollable v-model="display" width="600">
    <v-card>
      <v-card-title class="headline primary lighten-2" primary-title>Region管理</v-card-title>
      <v-card-text>
        <v-row class="mt-1">
            <v-col>
                <!-- TODO -->
              <v-btn x-small fab class='mr-1' color="primary"><v-icon>mdi-plus</v-icon></v-btn>
              <v-btn small color="error" @click="dialog.regionTable.deleteSelected()"><v-icon>mdi-trash-can</v-icon></v-btn>
            </v-col>
            <v-col>
                <v-text-field dense single-line hide-details small v-model="dialog.regionTable.search"
                    append-icon="mdi-magnify" label="搜索"></v-text-field>
            </v-col>
            <v-col cols="1">
                <v-btn fab x-small color="info" v-on:click="dialog.regionTable.refresh()"><v-icon>mdi-refresh</v-icon></v-btn>
            </v-col>
        </v-row>
        <v-data-table dense show-select class="mt-1 elevation-1" :loading="dialog.regionTable.loading" :headers="dialog.regionTable.headers" :items="dialog.regionTable.items"
            :items-per-page="dialog.regionTable.itemsPerPage" :search="dialog.regionTable.search" v-model="dialog.regionTable.selected">
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
        show: Boolean,
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
