<template>
  <v-row>
    <v-col cols="12">
      <v-data-table density='compact' show-expand single-expand :headers="table.headers" :items="table.items"
        :items-per-page="table.itemsPerPage" :search="table.search" v-model="table.selected" :loading="table.loading">

        <template v-slot:top>
          <v-row>
            <v-col>
              <v-text-field small density='compact' v-model="table.search" label="搜索" single-line
                hide-details></v-text-field>
            </v-col>
            <v-col class="my-auto text-right">
              <chip-link link="/dashboard/hypervisor/tenantUsage" :label="$t('tenantUsage')"></chip-link>
              <v-btn variant="text" icon="mdi-refresh" color="info" v-on:click="table.refresh()"></v-btn>
            </v-col>
          </v-row>
        </template>

        <template v-slot:[`item.status`]="{ item }">
          <v-icon v-if="item.status == 'enabled'" color="success">mdi-emoticon-happy</v-icon>
          <v-icon v-else color="red">mdi-emoticon-sad</v-icon>
        </template>

        <template v-slot:[`item.memory_mb`]="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ props }">
              <v-progress-linear v-bind="props" height="12" color="info" rounded
                :model-value="item.memory_mb - item.free_ram_mb" :max="item.memory_mb">
              </v-progress-linear>
            </template>
            已使用: {{ item.memory_mb_used }} <br>
            不可用: {{ item.memory_mb - item.free_ram_mb - item.memory_mb_used }} <br>
            总量: {{ item.memory_mb }}
          </v-tooltip>
        </template>
        <template v-slot:[`item.vcpus`]="{ item }">

          <v-tooltip bottom>
            <template v-slot:activator="{ props }">
              <v-progress-linear v-bind="props" height="12" rounded color="info"
                :model-value="item.vcpus_used * 100 / item.vcpus"
                :buffer-value="item.vcpus_used * 100 / item.vcpus"></v-progress-linear>
            </template>
            已使用: {{ item.vcpus_used }}<br>
            总量: {{ item.vcpus }}
          </v-tooltip>

        </template>
        <template v-slot:[`item.local_gb`]="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ props }">
              <v-progress-linear v-bind="props" height="12" rounded color="info"
                :model-value="item.local_gb_used * 100 / item.local_gb"
                :buffer-value="item.local_gb_used * 100 / item.local_gb"></v-progress-linear>
            </template>
            已使用: {{ item.local_gb_used }} <br>
            总量: {{ item.local_gb }}
          </v-tooltip>
        </template>

        <template v-slot:expanded-row="{ columns, item }">
          <td :colspan="columns.length - 1">
            <v-table density='compact'>
              <template v-slot:default>
                <tr v-for="extendItem in table.extendItems" v-bind:key="extendItem.title" class="text-left">
                  <th>{{ extendItem.title }}:</th>
                  <td>{{ item[extendItem.title] }}</td>
                </tr>
              </template>
            </v-table>
          </td>
        </template>
      </v-data-table>
    </v-col>
  </v-row>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { HypervisortTable } from '@/assets/app/tables';
import ChipLink from '@/components/plugins/ChipLink.vue';

var table = reactive(new HypervisortTable())

table.loading = ref(false);

async function refresh() {
  await table.refresh();
}

refresh();

</script>