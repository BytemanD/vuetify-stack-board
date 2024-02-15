<template>
    <v-chip variant="text" :color="color" :density="density" :prepend-icon="hideLinkIcon ? '' : 'mdi-link-variant'" @click="$router.push(link)">
        {{ label || link }}
    </v-chip>
</template>

<script>
export default {
    props: {
        link: {
            type: String,
            default: '#',
        },
        color: {
            type: String,
            default: 'info',
        },
        hideLinkIcon: {
            type: Boolean,
            default: false,
        },
        density: {
            type: String,
            default: 'compact',
        },
        label: {
            type: String,
            default: '',
        },
    },
};

</script>