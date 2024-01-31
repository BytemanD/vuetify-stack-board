<template>
  <v-row>
    <v-col cols="12">
      <!-- 简单的表格 -->
      <v-data-table v-if="!editable" density='compact' :loading="table.loading" :headers="table.MiniHeaders"
        :items="table.items" :items-per-page="5" :search="table.search" @click:row="selectFlavor" hover>
        <template v-slot:top>
          <v-row>
            <v-col></v-col>
            <v-col cols="12" lg="6">
              <v-text-field small density='compact' v-model="table.search" label="搜索" single-line
                hide-details></v-text-field>
            </v-col>
            <v-col cols="1" class="text-center">
              <v-btn variant="text" icon="mdi-refresh" color="info"
                v-on:click="table.refresh()"><v-icon>mdi-refresh</v-icon></v-btn>
            </v-col>
          </v-row>
        </template>

        <template v-slot:[`item.name`]="{ item }">
          <v-chip v-if="item.name == selectedFlavor.name" density="compact"
          :color="item.name == selectedFlavor.name ? 'info' : ''">
          {{ item.name }}</v-chip>
          <v-chip v-else variant="text">{{ item.name }}</v-chip>
        </template>
        <template v-slot:[`item.ram`]="{ item }">{{ Utils.humanRam(item.ram) }}</template>
      </v-data-table>

      <!-- 详细的表格 -->
      <v-data-table v-else density='compact' show-select show-expand :loading="table.loading" :headers="table.headers"
        :items="table.items" :items-per-page="editable ? table.itemsPerPage : 5" :search="table.search"
        v-model="table.selected" hover>

        <template v-slot:top>
          <v-row>
            <v-col cols="12" md="5" sm="12">
              <v-toolbar v-if="editable" density="compact" class="rounded-pill">
                <NewFlavorDialog @completed="table.refresh()" />
                <v-spacer></v-spacer>
                <delete-comfirm-dialog :disabled="table.selected.length == 0" title="确定删除规格?"
                  @click:comfirm="table.deleteSelected()" :items="table.getSelecedItems()" />
              </v-toolbar>
            </v-col>
            <v-col>
              <v-text-field small density='compact' v-model="table.search" label="搜索" single-line
                hide-details></v-text-field>
            </v-col>
            <v-col cols="1" class="text-center">
              <v-btn variant="text" icon="mdi-refresh" color="info"
                v-on:click="table.refresh()"><v-icon>mdi-refresh</v-icon></v-btn>
            </v-col>
          </v-row>
        </template>

        <template v-if="!editable" v-slot:[`item.name`]="{ item }">
          <v-chip variant="text" density="compact" :color="item.name == selectedFlavor.name ? 'info' : ''">
            {{ item.id }}</v-chip>
        </template>

        <template v-slot:[`item.ram`]="{ item }">{{ Utils.humanRam(item.ram) }}</template>
        <template v-if="editable" v-slot:expanded-row="{ columns, item }">
          <td></td>
          <td>属性</td>
          <td :colspan="columns.length - 1">
            <v-chip size="small" label class="mt-1 mb-1 mr-1" v-for="(value, key) in table.extraSpecsMap[item.id]"
              v-bind:key="key">
              {{ key }}={{ value }}
            </v-chip>
            <v-btn text="编辑属性" color="warning" variant="text" class="my-auto"
              @click="openFlavorExtraDialog(item)"></v-btn>
          </td>
        </template>
      </v-data-table>
    </v-col>
    <FlavorExtraDialog :show="showFlavorExtraDialog" @update:show="(e) => showFlavorExtraDialog = e"
      :flavor="selectedFlavor" @completed="table.refresh()" />
  </v-row>
</template>

<script>
import { Utils } from '@/assets/app/lib.js';

import { FlavorDataTable } from '@/assets/app/tables';
import DeleteComfirmDialog from '@/components/plugins/dialogs/DeleteComfirmDialog.vue';

import NewFlavorDialog from '@/components/dashboard/containers/compute/dialogs/NewFlavorDialog.vue';
import FlavorExtraDialog from '@/components/dashboard/containers/compute/dialogs/FlavorExtraDialog.vue';


export default {
  components: {
    NewFlavorDialog, FlavorExtraDialog, DeleteComfirmDialog,
  },
  props: {
    editable: { type: Boolean, default: false },
  },

  data: () => ({
    Utils: Utils,
    table: new FlavorDataTable(),

    showFlavorExtraDialog: false,
    selectedFlavor: {},
  }),
  methods: {
    selectFlavor: function (event, data) {
      this.selectedFlavor = data.item;
      this.$emit("select-flavor", data.item);
    },
    itemSelected: function (a, item, value) {
      console.log(item, value)

    },
    openFlavorExtraDialog(item) {
      this.selectedFlavor = item;
      this.showFlavorExtraDialog = !this.showFlavorExtraDialog;
    }
  },
  created() {
    this.table.refresh()
  }
};
</script>
