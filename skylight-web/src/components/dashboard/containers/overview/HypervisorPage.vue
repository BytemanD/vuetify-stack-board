<template>
  <v-row>
    <v-col>
      <v-sheet class="text-center">
        <h4>{{ $t('memory') }}</h4>
        <v-tooltip bottom>
          <template v-slot:activator="{ props }">
            <v-progress-circular v-bind="props" size="120" width="60" :model-value="table._memUsedPercent"
              :loading="table.loading"
              :color="table._memUsedPercent < resourceWarningPercent.value ? 'green-lighten-1' : 'red-lighten-2'">
            </v-progress-circular>
          </template>
          百分比: {{ table._memUsedPercent }}%<br>剩余: {{ table.statistics.free_ram_mb }}
        </v-tooltip>
      </v-sheet>
    </v-col>
    <v-col>
      <v-sheet class="text-center">
        <h4>{{ $t('cpu') }}</h4>
        <v-tooltip bottom>
          <template v-slot:activator="{ props }">
            <v-progress-circular v-bind="props" size="120" width="60" :model-value="table._vcpuUsedPercent"
              :color="table._vcpuUsedPercent < resourceWarningPercent.value ? 'green-lighten-1' : 'red-lighten-2'">
            </v-progress-circular>
          </template>
          百分比: {{ table._vcpuUsedPercent }}%<br>剩余: {{ table.statistics.vcpus - table.statistics.vcpus_used }}
        </v-tooltip>
      </v-sheet>
    </v-col>
    <v-col>
      <v-sheet class="text-center">
        <h4>{{ $t('disk') }}</h4>
        <v-tooltip bottom>
          <template v-slot:activator="{ props }">
            <v-progress-circular v-bind="props" size="120" width="60" :model-value="table._diskUsedPercent"
              :color="table._diskUsedPercent < resourceWarningPercent.value ? 'green-lighten-1' : 'red-lighten-1'">
            </v-progress-circular>
          </template>
          百分比: {{ table._diskUsedPercent }}%<br>剩余: {{ table.statistics.local_gb - table.statistics.local_gb_used }}
        </v-tooltip>
      </v-sheet>
    </v-col>
    <v-col>
      <v-sheet class="text-center">
        <h4>{{ $t('node') }}</h4>
        <v-tooltip bottom>
          <template v-slot:activator="{ props }">
            <v-progress-circular size="120" width="60" v-bind="props"
              :model-value="table.statistics.count * 100 / table.items.length"
              :color="table._diskUsedPercent < resourceWarningPercent.value ? 'green-lighten-1' : 'red-lighten-1'">
            </v-progress-circular>
          </template>
          {{ table.statistics.count }}/{{ table.items.length }}<br>
        </v-tooltip>
      </v-sheet>
    </v-col>
    <v-col>
      <v-sheet class="text-center" height="100%">
        <div class="mt-10 my-auto">
          <strong>
            {{ $t('instance') }}:{{ table.statistics.running_vms }} <br>
            {{ $t('workload') }}:{{ table.statistics.current_workload }} <br>
          </strong>
        </div>
      </v-sheet>
    </v-col>

    <v-col cols="12">
      <v-card density='compact'>
        <v-card-text>
          <v-row>
            <v-col class="px-auto">
              <v-btn variant="text" color="info" @click="() => $router.push('/dashboard/hypervisor/tenantUsage')">
                {{ $t('tenantUsage') }}</v-btn>
            </v-col>
            <v-col>
              <v-text-field density='compact' v-model="table.search" label="搜索" single-line hide-details></v-text-field>
            </v-col>
            <v-col cols="1">
              <v-btn variant="text" icon="mdi-refresh" color="primary" @click="refresh()"></v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12">
      <v-data-table density='compact' show-expand single-expand :headers="table.headers" :items="table.items"
        :items-per-page="table.itemsPerPage" :search="table.search" v-model="table.selected" :loading="table.loading">

        <template v-slot:[`item.status`]="{ item }">
          <v-icon v-if="item.status == 'enabled'" color="success">mdi-emoticon-happy</v-icon>
          <v-icon v-else color="red">mdi-emoticon-sad</v-icon>
        </template>

        <template v-slot:[`item.memory_mb`]="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ props }">
              <v-sheet color="grey lighten-1" v-bind="props">
                <v-progress-linear height="20" color="info" :model-value="item.memory_mb - item.free_ram_mb"
                  :max="item.memory_mb">
                </v-progress-linear>
              </v-sheet>
            </template>
            已使用: {{ item.memory_mb_used }} <br>
            不可用: {{ item.memory_mb - item.free_ram_mb - item.memory_mb_used }} <br>
            总量: {{ item.memory_mb }}
          </v-tooltip>
        </template>
        <template v-slot:[`item.vcpus`]="{ item }">

          <v-tooltip bottom>
            <template v-slot:activator="{ props }">
              <v-sheet color="grey lighten-1" v-bind="props">
                <v-progress-linear height="20" class="white--text" color="info"
                  :model-value="item.vcpus_used * 100 / item.vcpus"
                  :buffer-value="item.vcpus_used * 100 / item.vcpus"></v-progress-linear>
              </v-sheet>
            </template>
            已使用: {{ item.vcpus_used }}<br>
            总量: {{ item.vcpus }}
          </v-tooltip>

        </template>
        <template v-slot:[`item.local_gb`]="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ props }">
              <v-sheet color="grey lighten-1" v-bind="props">
                <v-progress-linear height="20" class="white--text" color="info"
                  :model-value="item.local_gb_used * 100 / item.local_gb"
                  :buffer-value="item.local_gb_used * 100 / item.local_gb"></v-progress-linear>
              </v-sheet>
            </template>
            已使用: {{ item.local_gb_used }} <br>
            总量: {{ item.local_gb }}
          </v-tooltip>
        </template>

        <template v-slot:expanded-row="{ columns, item }">
          <td></td>
          <td :colspan="columns.length - 1">
            <tr v-for="extendItem in table.extendItems" v-bind:key="extendItem.title">
              <td></td>
              <td class="text-info">{{ extendItem.value }}: </td>
              <td>{{ item[extendItem.value] }}</td>
            </tr>
          </td>
        </template>
      </v-data-table>
    </v-col>
  </v-row>
</template>

<script setup>
import { reactive, ref } from 'vue';

import { HypervisortTable } from '@/assets/app/tables';

import SETTINGS from '@/assets/app/settings';

var table = reactive(new HypervisortTable())
var resourceWarningPercent = SETTINGS.ui.getItem('resourceWarningPercent')

table.loading = ref(false);

async function refresh() {
  await table.refresh();
  table.refreshStatics();
}

refresh();

</script>