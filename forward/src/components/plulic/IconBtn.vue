<template>
    <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-on:click="onclickCallback()" v-bind="attrs" v-on="on">
            <v-icon :color="color">{{icon}}</v-icon>
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
        onClick: {
            type: Function,
            default: null
        }
    },
    data: () => ({

        // miniVariant: false,
    }),
    methods: {
        onclickCallback: function(){
            if (this.onClick){
                this.onClick();
            }
        }

    },

};


</script>