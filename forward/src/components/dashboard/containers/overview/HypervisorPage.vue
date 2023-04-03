<template>
  <v-row>
    <v-col>
      <v-sheet elevation="2" class="pa-2 text-center">
        <h4>{{ I18N.t('memory') }}</h4>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-progress-circular v-bind="attrs" v-on="on" rotate="360" size="120" width="60"
              :value="table._memUsedPercent" :color="table._memUsedPercent < resourceWarningPercent.value ? 'green lighten-1' : 'orange lighten-1'">
            </v-progress-circular>
          </template>
          百分比: {{ table._memUsedPercent }}%<br>剩余: {{ table.statistics.free_ram_mb }}
        </v-tooltip>
      </v-sheet>
    </v-col>
    <v-col>
      <v-sheet elevation="2" class="pa-2 text-center">
        <h4>{{ I18N.t('cpu') }}</h4>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-progress-circular v-bind="attrs" v-on="on" size="120" width="60"
              :value="table._vcpuUsedPercent" :color="table._vcpuUsedPercent < resourceWarningPercent.value ? 'green lighten-1' : 'orange lighten-1'">
            </v-progress-circular>
          </template>
          百分比: {{ table._vcpuUsedPercent }}%<br>剩余: {{ table.statistics.vcpus - table.statistics.vcpus_used }}
        </v-tooltip>
      </v-sheet>
    </v-col>
    <v-col>
      <v-sheet elevation="2" class="pa-2 text-center">
        <h4>{{ I18N.t('disk') }}</h4>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-progress-circular v-bind="attrs" v-on="on" size="120" width="60"
              :value="table._diskUsedPercent" :color="table._diskUsedPercent < resourceWarningPercent.value ? 'green lighten-1' : 'orange lighten-1'">
            </v-progress-circular>
          </template>
          百分比: {{ table._diskUsedPercent }}%<br>剩余: {{ table.statistics.local_gb - table.statistics.local_gb_used }}
        </v-tooltip>
      </v-sheet>
    </v-col>
    <v-col>
      <v-sheet elevation="2" class="pa-2 text-center">
        <h4>{{ I18N.t('node') }}</h4>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-progress-circular size="120" width="60" v-bind="attrs" v-on="on"
              :value="table.statistics.count * 100 / table.items.length" color="green lighten-1">
            </v-progress-circular>
          </template>
          {{ table.statistics.count }}/{{ table.items.length }}<br>
        </v-tooltip>
      </v-sheet>
    </v-col>
    <v-col >
      <v-sheet elevation="2" class="pa-2 text-center" height="100%">
        <div class="mt-10 my-auto">
          <strong>
            {{ I18N.t('instance') }}:{{ table.statistics.running_vms }} <br>
            {{ I18N.t('workload') }}:{{ table.statistics.current_workload }} <br>
          </strong>
        </div>
      </v-sheet>
    </v-col>

    <v-col cols="12">
      <v-card dense>
        <v-card-text>
          <v-row>
            <v-col>
              <v-btn class="mx-1" small color="info" v-on:click="showUsageDialog = !showUsageDialog">{{
                I18N.t('tenantUsage') }}</v-btn>
            </v-col>
            <v-col>
              <v-text-field small dense v-model="table.search" append-icon="mdi-magnify" label="搜索" single-line
                hide-details></v-text-field>
            </v-col>
            <v-col cols="1">
              <v-btn x-small fab color="primary" v-on:click="refresh()"><v-icon>mdi-refresh</v-icon></v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12">
      <v-data-table dense show-expand single-expand :loading="table.loading" :headers="table.headers" :items="table.items"
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
        <template v-slot:[`item.local_gb`]="{ item }">
          <v-progress-linear height="20" :value="item.local_gb_used * 100 / item.local_gb" color="cyan">
            {{ item.local_gb_used }}/{{ item.local_gb }}
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
import SETTINGS from '@/assets/app/settings';

export default {
  components: {
    UsageDialog,
  },

  data: () => ({
    key: null,
    I18N: I18N,
    table: new HypervisortTable(),
    tenantUsageDialog: new TenantUsageDialog(),
    resourceWarningPercent: SETTINGS.ui.getItem('resourceWarningPercent'),
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