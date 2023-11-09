<template>
    <v-btn prepend-icon="mdi-link" variant="text" :size="size" color="info" :text="text" v-on:click="click()">
    </v-btn>
</template>

<script>

export default {
    props: {
        routerTo: String,
        text: String,
        size: {
            type: String,
            default: 'default',
        },
    },
    methods: {
        click() {
            this.$router.push(this.routerTo)
        }
    },
}

</script>