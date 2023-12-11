<template>
  <v-row>
    <v-col cols="12">
      <v-data-table density='compact' show-select show-expand single-expand :loading="table.loading"
        :headers="table.headers" :items="table.items" :items-per-page="table.itemsPerPage" :search="table.search"
        v-model="table.selected">
        <template v-slot:top>
          <v-row>
            <v-col cols="6">
              <v-toolbar density="compact" class="rounded-pill">
                <NewImageVue :images="table.selected" @completed="table.resetSelected(); table.refresh()" />
                <v-spacer></v-spacer>
                <ImageDeleteSmartDialog :images="table.selected" @completed="table.resetSelected(); table.refresh()" />
              </v-toolbar>
            </v-col>
            <v-col>
              <v-text-field density='compact' v-model="table.search" label="搜索" single-line hide-details></v-text-field>
            </v-col>
            <v-col cols="12" md="2" sm="12">
              <v-btn color="info" icon="mdi-refresh" variant="text" v-on:click="table.refresh()"></v-btn>
              <v-btn color="primary" variant="text" icon="mdi-progress-upload"
                @click="showTasksDialog = !showTasksDialog">
              </v-btn>
            </v-col>
          </v-row>
        </template>

        <template v-slot:[`item.status`]="{ item }">
          <v-icon v-if="item.status == 'active'" color="success">mdi-emoticon-happy</v-icon>
          <v-icon v-else-if="item.status == 'error'" color="red">mdi-emoticon-sad</v-icon>
          <template v-else-if="item.status == 'saving'">
            <v-icon color="warning" class="mdi-spin">mdi-rotate-right</v-icon>{{ item.status }}
          </template>
          <p v-else>{{ item.status }}</p>
        </template>

        <template v-slot:[`item.size`]="{ item }"><span class="blue--text">{{ table.humanSize(item) }}</span></template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn size="small" variant='text' color="purple" @click="openImagePropertiesDialog(item)">设置属性</v-btn>
        </template>

        <template v-slot:expanded-row="{ columns, item }">
          <td></td>
          <td :colspan="columns.length - 1">
            <table>
              <template>
                <tr v-for="extendItem in table.extendItems" v-bind:key="extendItem.text">
                  <td class="text-info">{{ extendItem.text }}:</td>
                  <td>{{ item[extendItem.value] }}</td>
                </tr>
              </template>
              <tr>
                <td class="text-info">Properties</td>
                <td>
                  <template v-for="(value, key) in item">
                    <v-chip size="x-small" label v-bind:key="key" v-if="key.startsWith('hw')" class="mr-2">
                      {{ key }}={{ value }}</v-chip>
                  </template>
                </td>
              </tr>
            </table>
          </td>
        </template>
      </v-data-table>
    </v-col>
    <ImagePropertiesDialog :show.sync="showImagePropertiesDialog" @update:show="(e) => showImagePropertiesDialog = e"
      :image="selectedImage" @completed="table.refresh()" />
    <TasksDialog :show.sync="showTasksDialog" />
  </v-row>
</template>

<script>
import { ImageDataTable } from '@/assets/app/tables';
import NewImageVue from './dialogs/NewImage.vue';

import ImageDeleteSmartDialog from './dialogs/ImageDeleteSmartDialog.vue';
import ImagePropertiesDialog from './dialogs/ImagePropertiesDialog.vue';
import TasksDialog from './dialogs/TasksDialog.vue';

export default {
  components: {
    NewImageVue, ImageDeleteSmartDialog, ImagePropertiesDialog,
    TasksDialog,
  },

  data: () => ({
    selectedImage: {},
    table: new ImageDataTable(),
    openNewImageDialog: false,
    openImageDeleteSmartDialog: false,
    showImagePropertiesDialog: false,
    showTasksDialog: false,
  }),
  methods: {
    openImagePropertiesDialog(image) {
      this.selectedImage = image;
      this.showImagePropertiesDialog = !this.showImagePropertiesDialog;
    }
  },
  created() {
    this.table.refresh()
  }
};
</script>
