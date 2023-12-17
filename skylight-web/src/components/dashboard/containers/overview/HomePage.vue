<template>
  <v-row>
    <v-col cols="12" md="7">
      <v-card elevation="4" title="平台概况">
        <v-divider></v-divider>
        <v-card-text>
          <v-row>
            <v-col class="text-center">
              <h1 class="ma-8">{{ table.projects.length }}</h1>
              <v-chip variant="text" prepend-icon="mdi-dots-grid">
                <h4>项目</h4>
              </v-chip>
            </v-col>
            <v-col class="text-center">
              <h1 class="ma-8">{{ table.users.length }}</h1>
              <v-chip variant="text" prepend-icon="mdi-account-outline">
                <h4>用户</h4>
              </v-chip>
            </v-col>
            <v-col class="text-center">
              <h1 class="ma-8">{{ table.statistics.running_vms || 0 }}</h1>
              <v-chip variant="text" prepend-icon="mdi-laptop" @click="$router.push('/dashboard/server')">
                <h4>实例</h4>
              </v-chip>
            </v-col>
            <v-col class="text-center">
              <h1 class="ma-8">{{ table.statistics.current_workload || 0 }}</h1>
              <v-chip variant="text" prepend-icon="mdi-lightning-bolt-outline">
                <h4>负载</h4>
                <br>
              </v-chip>
            </v-col>
            <v-col class="text-center">
              <h1 class="ma-8">
                <span
                  :class="table.percentAvaliableHypervisor() >= resourceWarningPercent.value ? '' : 'text-red-lighten-2'">
                  {{ table.statistics.count || 0 }}/{{ table.hypervisors.length }}
                </span>
              </h1>
              <v-chip variant="text" prepend-icon="mdi-blur" @click="$router.push('/dashboard/hypervisor')">
                <h4>节点</h4>
              </v-chip>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="5">
      <v-card elevation="4" title="资源使用量">
        <template v-slot:append>
          <v-btn density="compact" variant="text" icon="mdi-refresh" @click="table.refreshAndWait()"></v-btn>
        </template>
        <v-divider></v-divider>
        <v-card-text>
          <v-row>
            <v-col class="text-center">
              <h4>{{ $t('memory') }}</h4>
              <v-tooltip end>
                <template v-slot:activator="{ props }">
                  <v-progress-circular :indeterminate="table.refreshing" v-bind="props" size="96" width="10"
                    :model-value="table._memUsedPercent" :loading="table.loading"
                    :color="table._memUsedPercent < resourceWarningPercent.value ? 'blue-lighten-1' : 'red-lighten-2'">
                    {{ table._memUsedPercent }}%
                  </v-progress-circular>
                </template>
                使用: {{ table.statistics.memory_mb_used }}/ {{ table.statistics.memory_mb || 0 }}
              </v-tooltip>
            </v-col>
            <v-col class="text-center">
              <h4>{{ $t('cpu') }}</h4>
              <v-tooltip bottom>
                <template v-slot:activator="{ props }">
                  <v-progress-circular :indeterminate="table.refreshing" v-bind="props" size="96" width="10"
                    :model-value="table._vcpuUsedPercent"
                    :color="table._vcpuUsedPercent < resourceWarningPercent.value ? 'blue-lighten-1' : 'red-lighten-2'">
                    {{ table._vcpuUsedPercent }}%
                  </v-progress-circular>
                </template>
                使用: {{ table.statistics.vcpus_used }}/{{ table.statistics.vcpus || 0 }}
              </v-tooltip>
            </v-col>
            <v-col class="text-center">
              <h4>{{ $t('disk') }}</h4>
              <v-tooltip bottom>
                <template v-slot:activator="{ props }">
                  <v-progress-circular :indeterminate="table.refreshing" v-bind="props" size="96" width="10"
                    :model-value="table._diskUsedPercent"
                    :color="table._diskUsedPercent < resourceWarningPercent.value ? 'blue-lighten-1' : 'red-lighten-1'">
                    {{ table._diskUsedPercent }}%
                  </v-progress-circular>
                </template>
                使用: {{ table.statistics.local_gb_used }}/{{ table.statistics.local_gb }}
              </v-tooltip>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="8">
      <limits-card />
    </v-col>
    <v-col cols="12" md="4">
      <user-card />
    </v-col>
  </v-row>
</template>

<script setup>
import { reactive, ref } from 'vue';

import { Overview } from '@/assets/app/tables';
import SETTINGS from '@/assets/app/settings';

import UserCard from './UserCard.vue';
import LimitsCard from './LimitsCard.vue';

var table = reactive(new Overview())
var resourceWarningPercent = SETTINGS.ui.getItem('resourceWarningPercent')

table.loading = ref(false);

table.refresh()

// setInterval(()=>{
//   table.refreshStatics()
// }, 1000 * 2)

</script>