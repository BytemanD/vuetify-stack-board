<template>
    <v-col>
        <v-alert v-if="consoleError != ''" color="red" variant="text" icon="mdi-alert">{{ consoleError }}</v-alert>
        <iframe v-else-if="consoleUrl" width="100%" height="800px" :src="consoleUrl"></iframe>
    </v-col>
</template>
<script setup>

const props = defineProps({
    serverId: { type: String, required: true, },
    consoleUrl: { type: String, required: true, },
    consoleError: { type: String },
})

</script>