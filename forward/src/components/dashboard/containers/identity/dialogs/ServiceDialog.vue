<template>
<v-dialog scrollable v-model="display" width="900">
    <v-card>
      <v-card-title class="headline primary lighten-2" primary-title>服务管理</v-card-title>
      <v-card-text>
        <v-row class="mt-1">
            <v-col>
                <!-- TODO -->
              <v-btn x-small fab class='mr-1' color="primary"><v-icon>mdi-plus</v-icon></v-btn>
              <v-btn small class='mr-1' color="error" @click="dialog.serviceTable.deleteSelected()"><v-icon>mdi-trash-can</v-icon></v-btn>
            </v-col>
            <v-col>
                <v-text-field dense single-line hide-details small v-model="dialog.serviceTable.search"
                    append-icon="mdi-magnify" label="搜索"></v-text-field>
            </v-col>
            <v-col cols="1">
                <v-btn fab x-small color="info" v-on:click="dialog.serviceTable.refresh()"><v-icon>mdi-refresh</v-icon></v-btn>
            </v-col>
        </v-row>
        <v-data-table dense show-select class="mt-1" :loading="dialog.serviceTable.loading" :headers="dialog.serviceTable.headers" :items="dialog.serviceTable.items"
            :items-per-page="dialog.serviceTable.itemsPerPage" :search="dialog.serviceTable.search" v-model="dialog.serviceTable.selected">
        </v-data-table>
      </v-card-text>
    </v-card>
</v-dialog>


  
</template>

<script>
import i18n from '@/assets/app/i18n';
import { Utils } from '@/assets/app/lib';
import { ServiceDialog } from '@/assets/app/dialogs';

export default {
    props: {
        show: Boolean,
    },
    data: () => ({
        i18n: i18n,
        display: false,
        Utils: Utils,
        dialog: new ServiceDialog(),
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
