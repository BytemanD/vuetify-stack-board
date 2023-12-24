<template>
  <v-dialog v-model="display" width="500" scrollable persistent>
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" icon="mdi-trash-can" color="red" :disabled="disabled"></v-btn>
    </template>
    <v-card color="blue-grey-darken-2">
      <v-card-title class="text-red" icon="mdi-alert">{{ title }}</v-card-title>
      <v-card-text>
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

const display = ref(false);

const emits = defineEmits(['click:comfirm'])
const progs = defineProps({
  title: { type: String, default: '确认删除?' },
  disabled: { type: Boolean, default: false },
  itemValueFunc: { type: Function, },
  items: { type: Array, default: [] },
})

function getItemValue(item) {
  if (progs.itemValueFunc) {
    return progs.itemValueFunc(item)
  }
  if (typeof item == 'object') {
    return item.name || item.id
  }
  return item
}

function comfirmCallback() {
  emits('click:comfirm', true)
  display.value = false;
}

</script>
