<template>
    <v-tooltip location="bottom" text=" 进入首页">
        <template v-slot:activator="{ props }">
            <v-btn icon v-on:click="onclickCallback()" v-bind="props">
                <v-icon>mdi-home</v-icon>
            </v-btn>
        </template>
       
    </v-tooltip>
</template>

<script>

export default {
  methods: {
    onclickCallback() {
        this.$router.push('/welcome')
    }
  },
}

</script>