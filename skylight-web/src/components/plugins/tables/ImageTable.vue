<template>
  <v-row>
    <v-col cols="12">
      <v-data-table density='compact' :show-select="editable" :show-expand="editable" :loading="table.loading"
        :headers="editable ? table.headers : table.MiniHeaders" :items="table.items"
        :items-per-page="editable ? table.itemsPerPage : 5" :search="table.search" v-model="table.selected">
        <template v-slot:top>
          <v-row>
            <v-col cols="4" v-if="editable">
              <v-toolbar density="compact" class="rounded-pill">
                <NewImageVue :images="table.selected" @completed="table.resetSelected(); table.refresh()" />
                <v-spacer></v-spacer>
                <ImageDeleteSmartDialog :images="table.selected" @completed="table.resetSelected(); table.refresh()" />
              </v-toolbar>
            </v-col>
            <v-col class="my-auto text-center">
              <v-btn-toggle density="compact" variant="outlined" color="info" @click="table.refresh()"
                v-model="table.visibility">
                <v-btn value="public">{{ $t('public') }}</v-btn>
                <v-btn value="shared">{{ $t('shared') }}</v-btn>
                <v-btn value="private">{{ $t('private') }}</v-btn>
              </v-btn-toggle>
            </v-col>
            <v-col>
              <v-text-field density='compact' v-model="table.search" label="搜索" single-line hide-details></v-text-field>
            </v-col>
            <v-col cols="12" md="2" sm="12">
              <v-btn color="info" icon="mdi-refresh" variant="text" v-on:click="table.refresh()"></v-btn>
              <TasksDialog v-if='editable' :show.sync="showTasksDialog" />
            </v-col>
          </v-row>
        </template>
        <template v-if="!editable" v-slot:[`item.id`]="{ item }">
          <v-chip variant="text" density="compact" :color="item.id == selectedImage.id ? 'info' : ''"
            @click="selectImage(item)">{{
              item.id }}</v-chip>
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
  </v-row>
</template>

<script>
import { ImageDataTable } from '@/assets/app/tables';
import NewImageVue from '@/components/dashboard/containers/image/dialogs/NewImage.vue';

import DeleteComfirmDialog from '@/components/plugins/dialogs/DeleteComfirmDialog.vue';
import ImageDeleteSmartDialog from '@/components/dashboard/containers/image/dialogs/ImageDeleteSmartDialog.vue';
import ImagePropertiesDialog from '@/components/dashboard/containers/image/dialogs/ImagePropertiesDialog.vue';
import TasksDialog from '@/components/dashboard/containers/image/dialogs/TasksDialog.vue';

export default {
  components: {
    NewImageVue, ImageDeleteSmartDialog, ImagePropertiesDialog,
    TasksDialog, DeleteComfirmDialog,
  },
  props: {
    editable: { type: Boolean, default: false },
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
    selectImage: function (item) {
      this.$emit("select-image", item);
    },
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
