<template>
  <v-dialog v-model="display" width="500" scrollable persistent>
    <template v-slot:activator="{ props }">
      <!-- <btn-live-migrate-abort v-bind="props"/> -->
      <v-btn v-bind="props" color="red" :variant="variant" :size="size" density="compact">终止</v-btn>
    </template>
    <v-card color="blue-grey-darken-2">
      <v-card-title class="text-red" icon="mdi-alert">{{ title }}</v-card-title>
      <v-card-text>
        实例：{{ getItemValue() }}
        <ol class="ml-6">
          <li v-for="(item, index) in items" :key="index">{{ getItemValue(item) }}</li>
        </ol>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-btn color='info' @click="display = false">取消</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="red" @click="comfirmCallback()">确定</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue'
import API from '@/assets/app/api';
import notify from '@/assets/app/notify';

const display = ref(false);

const emits = defineEmits([''])
const props = defineProps({
  title: { type: String, default: '确认终止热迁移?' },
  variant: { type: String, default: 'text' },
  size: { type: String, default: 'default' },
  itemValueFunc: { type: Function, },
  items: { type: Array, default: [] },
})

function getItemValue(item) {
  if (props.itemValueFunc) {
    return props.itemValueFunc(item)
  }
  if (typeof item == 'object') {
    return item.name || item.id
  }
  return item
}

async function comfirmCallback() {
  for (let i in props.items) {

    let serverId = null;
    if (typeof props.items[i] == 'string') {
      serverId = props.items[i]
    } else {
      serverId = props.items[i].id
    }
    let migrations = (await API.migration.list({
      instance_uuid: serverId, status: 'running', migration_type: 'live-migration',
    })).migrations;
    if (migrations.length == 0) {
      notify.warning(`实例 ${getItemValue(props.items[i])} 热迁移任务不存在`)
      continue
    }
    notify.info(`开始终止实例 ${getItemValue(props.items[i])} 热迁移任务`)
    API.server.liveMigrateAbort(serverId, migrations[0].id)
  }
  display.value = false;
}

</script>
