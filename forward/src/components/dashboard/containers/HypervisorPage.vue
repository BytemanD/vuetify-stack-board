<template>
<v-row >
  <v-col cols="6" lg="2" md="4" sm="4">
    <v-sheet elevation="2" class="pa-2 text-center">
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-progress-circular v-bind="attrs" v-on="on" rotate="360" size="120" width="20"
            :value="table._memUsedPercent" :color="table._memUsedPercent < 80 ? 'teal lighten-2' : 'orange lighten-2' ">
            {{I18N.t('memory')}}
          </v-progress-circular>
        </template>
        <span>百分比: {{ table._memUsedPercent }}%<br>剩余: {{ table.statistics.free_ram_mb }}</span>
      </v-tooltip>
    </v-sheet>
  </v-col>
  <v-col cols="6" lg="2" md="4" sm="4">
    <v-sheet elevation="2" class="pa-2 text-center">
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-progress-circular v-bind="attrs" v-on="on" rotate="360" size="120" width="20"
            :value="table._vcpuUsedPercent" :color="table._vcpuUsedPercent < 80 ?'teal lighten-2' : 'orange lighten-2' ">
            {{I18N.t('cpu')}}
          </v-progress-circular>
        </template>
        <span>百分比: {{ table._vcpuUsedPercent }}%<br>剩余: {{table.statistics.vcpus - table.statistics.vcpus_used }}</span>
      </v-tooltip>
    </v-sheet>
  </v-col>
  <v-col cols="6" lg="2" md="4" sm="4">
    <v-sheet elevation="2" class="pa-2 text-center">
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-progress-circular v-bind="attrs" v-on="on" rotate="360" size="120" width="20"
            :value="table._diskUsedPercent" :color="table._diskUsedPercent < 80 ? 'teal lighten-2' : 'orange lighten-2' ">
            {{ I18N.t('disk') }}
          </v-progress-circular>
        </template>
        <span>百分比: {{ table._diskUsedPercent }}%<br>剩余: {{table.statistics.local_gb - table.statistics.local_gb_used }}</span>
      </v-tooltip>
    </v-sheet>
  </v-col>
  <v-col cols="6" lg="2" md="4" sm="4">
    <v-sheet elevation="2" class="pa-2 text-center">
      <v-progress-circular size="120" width="20" :value="table.statistics.count * 100 / table.items.length" color="teal lighten-2">
        {{ I18N.t('node') }}<br>{{table.statistics.count}}/{{table.items.length}}
      </v-progress-circular>
    </v-sheet>
  </v-col>
  <v-col cols="6" lg="2" md="4" sm="4">
    <v-sheet elevation="2" class="pa-2 text-center" height="100%">
      <v-avatar size="110"> <span class="teal--text" >{{I18N.t('instance')}}<br>{{table.statistics.running_vms}}</span> </v-avatar>
    </v-sheet>
  </v-col>
  <v-col cols="6" lg="2" md="4" sm="2">
    <v-sheet elevation="2" class="pa-2 text-center" height="100%">
      <v-avatar size="110"> <span class="teal--text" >{{I18N.t('workload')}}<br>{{table.statistics.current_workload}}</span> </v-avatar>
    </v-sheet>
  </v-col>

  <v-col cols="12">
    <v-card dense>
      <v-card-text>
        <v-row>
          <v-col>
            <v-btn small color="primary" v-on:click="refresh()">{{ I18N.t('refresh') }}</v-btn>
            <v-btn class="mx-1" small color="info" v-on:click="showUsageDialog = !showUsageDialog">{{ I18N.t('tenantUsage') }}</v-btn>
          </v-col>
          <v-col>
            <v-text-field small dense v-model="table.search" append-icon="mdi-magnify" label="搜索" single-line
              hide-details></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-col>
  <v-col cols="12">
    <v-data-table dense show-expand single-expand :headers="table.headers" :items="table.items"
      :items-per-page="table.itemsPerPage" :search="table.search" show-select v-model="table.selected">
    
      <template v-slot:[`item.status`]="{ item }">
        <v-icon v-if="item.status == 'enabled'" color="success">mdi-emoticon-happy</v-icon>
        <v-icon v-else color="error">mdi-emoticon-sad</v-icon>
      </template>
    
      <template v-slot:[`item.memory_mb`]="{ item }">
        <v-progress-linear height="20" :value="item.memory_mb_used * 100 / item.memory_mb" color="cyan">
          {{ (item.memory_mb_used / 1024).toFixed(1) }}/{{ (item.memory_mb / 1024).toFixed(1) }}
        </v-progress-linear>
      </template>
      <template v-slot:[`item.vcpus`]="{ item }">
        <v-progress-linear height="20" :value="item.vcpus_used * 100 / item.vcpus" color="cyan">
          {{ item.vcpus_used }}/{{ item.vcpus }}
        </v-progress-linear>
      </template>
    
      <template v-slot:expanded-item="{ headers, item }">
        <td></td>
        <td :colspan="headers.length - 1">
          <table>
            <tr v-for="extendItem in table.extendItems" v-bind:key="extendItem.text">
              <td><strong>{{ extendItem.text }}:</strong> </td>
              <td>{{ item[extendItem.text] }}</td>
            </tr>
          </table>
        </td>
      </template>
    </v-data-table>
  </v-col>
  <v-col cols="12">
    <UsageDialog :show.sync="showUsageDialog" />
  </v-col>
</v-row>
</template>

<script>
import I18N from '@/assets/app/i18n'
import { HypervisortTable } from '@/assets/app/tables';
import { TenantUsageDialog } from '@/assets/app/dialogs';

import UsageDialog from './dialogs/TenantUsageDialog.vue';

export default {
  components: {
    UsageDialog,
  },

  data: () => ({
    key: null,
    I18N: I18N,
    table: new HypervisortTable(),
    tenantUsageDialog: new TenantUsageDialog(),
    showUsageDialog: false,
  }),
  methods: {
    async refresh() {
      await this.table.refresh();
      this.table.refreshStatics();
    },
  },
  created() {
    this.refresh();
  }
};
</script>