<template>
  <v-row>
    <v-col>
      <v-btn x-small fab class="mr-1" color="primary" @click="openNewImageDialog = true"><v-icon>mdi-plus</v-icon></v-btn>
      <v-btn small color="error" @click="openImageDeleteSmartDialog = true" :disabled="table.selected.length == 0">
        <v-icon small>mdi-trash-can</v-icon>删除
      </v-btn>
      <ImageDeleteSmartDialog :show.sync="openImageDeleteSmartDialog" :images="table.selected" @completed="table.resetSelected(); table.refresh()" />
    </v-col>
    <v-col>
      <v-text-field small dense v-model="table.search" append-icon="mdi-magnify" label="搜索" single-line
        hide-details></v-text-field>
    </v-col>
    <v-col cols="1" class="text-center">
      <v-btn fab x-small color="info" v-on:click="table.refresh()"><v-icon>mdi-refresh</v-icon></v-btn>
    </v-col>
    <v-col cols="1" class="text-right">
      <v-btn x-small fab color="primary" @click="table.tasksDialog.open()"><v-icon>mdi-progress-upload</v-icon></v-btn>
    </v-col>
    <v-col cols="12">
      <v-data-table dense show-select show-expand single-expand :headers="table.headers" :items="table.items"
        :items-per-page="table.itemsPerPage" :search="table.search" v-model="table.selected">

        <template v-slot:[`item.status`]="{ item }">
          <v-icon v-if="item.status == 'active'" color="success">mdi-emoticon-happy</v-icon>
          <v-icon v-else-if="item.status == 'error'" color="error">mdi-emoticon-sad</v-icon>
          <template v-else-if="item.status == 'saving'">
            <v-icon color="warning" class="mdi-spin">mdi-rotate-right</v-icon>{{ item.status }}
          </template>
          <p v-else>{{ item.status }}</p>
        </template>

        <template v-slot:[`item.size`]="{ item }"><span class="blue--text">{{ table.humanSize(item) }}</span></template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn small text color="purple" @click="imagePropertiesDialog.open(item)">设置属性</v-btn>
        </template>

        <template v-slot:expanded-item="{ headers, item }">
          <td></td>
          <td :colspan="headers.length - 1">
            <table>
              <template >
                <tr v-for="extendItem in table.extendItems" v-bind:key="extendItem.text">
                  <td class="info--text">{{ extendItem.text }}:</td>
                  <td>{{ item[extendItem.value] }}</td>
                </tr>
              </template>
              <tr>
                <td><strong>Properties</strong></td>
                <td>
                  <template v-for="(value, key) in item">
                    <v-chip x-small label v-bind:key="key" v-if="key.startsWith('hw')" class="mr-2">{{ key }}={{ value }}</v-chip>
                  </template>
                </td>
              </tr>
            </table>
          </td>
        </template>
      </v-data-table>
    </v-col>
    <v-col cols=12>
      <NewImageVue :show.sync="openNewImageDialog" :images="table.selected" @completed="table.resetSelected(); table.refresh()" />
      <!-- <ImageDeleteSmartDialog :show.sync="openImageDeleteSmartDialog" :images="table.selected" @completed="table.resetSelected(); table.refresh()" /> -->
    </v-col>
  </v-row>
</template>

<script>
import { ImageDataTable } from '@/assets/app/tables';
import NewImageVue from './image/dialogs/NewImage.vue';

import ImageDeleteSmartDialog from './image/dialogs/ImageDeleteSmartDialog.vue';

export default {
  components: {
    NewImageVue, ImageDeleteSmartDialog,
  },

  data: () => ({
    openNewImageDialog: false,
    openImageDeleteSmartDialog: false,
    table: new ImageDataTable()
  }),
  methods: {

  },
  created() {
    this.table.refresh()
  }
};
</script>
