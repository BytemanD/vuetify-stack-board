<template>
    <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-on:click="onClick()" v-bind="attrs" v-on="on">
                <v-icon :color="color">{{ icon }}</v-icon>
            </v-btn>
        </template>
        {{ toolTip }}
    </v-tooltip>
</template>

<script>

export default {
    props: {
        icon: String,
        color: {
            type: String,
            default: 'primary',
        },
        toolTip: String,
    },
    data: () => ({
    }),
    methods: {
        onClick: function () {
            this.$emit('click');
        },
    },
};

</script>