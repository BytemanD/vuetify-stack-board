<template>
    <v-tooltip location="bottom" text=" 进入首页">
        <template v-slot:activator="{ props }">
            <v-btn v-on:click="onclickCallback()" v-bind="props">
                <!-- <v-icon>mdi-home</v-icon> -->
                集群管理
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