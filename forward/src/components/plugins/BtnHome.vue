<template>
    <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-on:click="onclickCallback()" v-bind="attrs" v-on="on">
                <v-icon>mdi-home</v-icon>
            </v-btn>
        </template>
        进入首页
    </v-tooltip>
</template>

<script>

export default {
    methods: {
        onclickCallback: function () {
            window.open('/welcome.html', '_self');
        }
    },
};


</script>