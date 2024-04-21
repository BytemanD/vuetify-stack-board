<template>
    <v-col class="ma-0 pa-0">
        <v-tabs v-model="tabIndex" show-arrows :selected-class="'bg-' + color" :slider-color="color" density="compact">
            <v-tab v-for="(tab, i) in tabItems" v-bind:key="i">
                <v-icon v-if="tab.icon">{{ tab.icon }}</v-icon>{{ tab.text }}
            </v-tab>
            <slot name="tabs"></slot>
        </v-tabs>
        <div :class="'bg-' + color" style="height: 2px;"></div>
        <v-window v-model="tabIndex" class="mt-2">
            <v-col >
                <slot name="window-items"></slot>
            </v-col>
        </v-window>
    </v-col>
</template>

<script setup>
import { ref, defineProps, watch } from 'vue';

const props = defineProps({
    color: { type: String, default: 'blue-grey-lighten-1' },
    tabs: { type: Array, required: true, },
})
const emits = defineEmits(['switchTab'])

var tabIndex = ref(0);
var tabItems = ref([]);

function initTabItems() {
    let items = []
    for (let i in props.tabs) {
        let tab = props.tabs[i];
        let item = {};
        if (typeof tab == 'string') {
            item.text = tab;
        } else {
            item.text = tab.text
            if (tab.icon) {
                item.icon = tab.icon
            }
        }
        items.push(item)
    }
    tabItems.value = items;
}
watch(
    () => props.tabs,
    (newValue, oldValue) => {
        initTabItems()
    }
)
watch(
    () => tabIndex.value,
    (newValue, oldValue) => {
        emits('switchTab', tabIndex)
    }
)
initTabItems()


</script>