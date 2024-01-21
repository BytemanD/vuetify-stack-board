<template>
    <v-row>
        <v-col cols="6" md="4" lg="4" class="my-auto">
            <v-btn size="small" class='mr-1' color="info" variant="outlined" @click="refresh()" :loading="refreshing">刷新
            </v-btn>
            <v-btn size="small" class='mr-1' color="info" variant="outlined" @click="more()"
                :disabled="refreshing">更多...</v-btn>
            <v-btn size="small" class='mr-1' color="info" variant="outlined" @click="all()" :disabled="refreshing">全部
            </v-btn>
        </v-col>
        <v-col cols="6" md="4" lg="4">
            <v-text-field density='compact' hide-details v-model="consoleLines">
                <template v-slot:prepend>行数</template>
            </v-text-field>
        </v-col>

        <v-col cols="12" md="4" lg="4" class="my-auto">
            <v-switch density='compact' hide-details class="my-auto" color="purple" @click="toggleAutoRefresh()"
                label="自动刷新"></v-switch>
        </v-col>
        <v-col cols="12">
            <v-card>
                <v-card-text class="pa-0 bg-grey-darken-3">
                    <pre class="white--text grey darken-3 pa-4">{{ content }}</pre>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>
<script setup>
import { ref, defineProps } from 'vue';
import API from '@/assets/app/api';

const progs = defineProps({
    serverId: { type: String, required: true, },
})

var refreshing = ref(false)
var consoleLines = ref(10)
var content = ref('')
var interval = null

async function refreshConsoleLog(length) {
    refreshing.value = true;
    try {
        content.value = (await API.server.getConsoleLog(progs.serverId, length));
    } catch (e) {
        console.error(e)
    }
    refreshing.value = false;
}
async function refresh() {
    if (!consoleLines.value) {
        consoleLines.value = 10;
    }
    await refreshConsoleLog(consoleLines.value);
}
function toggleAutoRefresh() {
    if (interval) {
        clearInterval(interval);
        interval = null;
        return;
    } else {
        let self = this;
        interval = setInterval(() => {
            self.refresh()
        }, 5000);
    }
}
async function more() {
    if (consoleLines.value == null) {
        consoleLines.value = 10;
    }
    let length = parseInt(consoleLines.value) + 10;
    await refreshConsoleLog(length);
    consoleLines.value = length;
}
async function all() {
    await refreshConsoleLog(null);
    consoleLines.value = null;
}

refresh()

</script>