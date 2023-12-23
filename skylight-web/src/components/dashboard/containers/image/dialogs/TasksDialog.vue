<template>
    <v-dialog v-model="display" width="900" scrollable>
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" color="primary" variant="text" icon="mdi-progress-upload"></v-btn>
        </template>
        <v-card min-height="300">
            <v-card-title class="headline primary lighten-2" primary-title>镜像上传进度</v-card-title>
            <v-card-text>
                <v-list>
                    <v-list-item v-for="item in dialog.tasks.uploading" v-bind:key="item.id">
                        <v-list-item-title class="headline">
                            <v-progress-linear height="10" :value="item.readed"
                                :buffer-value="item.cached"></v-progress-linear>
                        </v-list-item-title>

                        <v-list-item-subtitle>
                            <v-chip label class="mr-1">镜像Id: {{ item.image_id }}</v-chip>
                            <v-chip label class="mr-1">总大小：{{ Utils.humanSize(item.size) }}</v-chip>
                            <v-chip label class="mr-1">缓存: {{ item.cached.toFixed(2) }}%</v-chip>
                            <v-chip label class="mr-1">上传: {{ item.readed.toFixed(2) }}%</v-chip>
                        </v-list-item-subtitle>

                        <v-btn icon="mdi-delete-circle" color="red" @click="deleteTask(item)"></v-btn>
                        <!-- <v-list-item-avatar @click="deleteTask(item)">
                        </v-list-item-avatar> -->
                    </v-list-item>
                </v-list>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>
<script>

import i18n from '@/assets/app/i18n';
import { Utils } from '@/assets/app/lib';

import { TasksDialog } from '@/assets/app/dialogs';

export default {
    props: {
        show: Boolean,
    },
    data: () => ({
        i18n: i18n,
        Utils: Utils,
        display: false,
        dialog: new TasksDialog(),
    }),
    methods: {
        async deleteTask(task) {
            await this.dialog.delete(task.id)
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
            if (!this.display) {
                this.dialog.stopInterval();
            }
        }
    },
};
</script>