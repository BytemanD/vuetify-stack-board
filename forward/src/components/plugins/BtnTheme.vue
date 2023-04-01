<template>
    <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-on:click="onclickCallback()" v-bind="attrs" v-on="on">
                <v-icon v-if="$vuetify.theme.dark">mdi-weather-night</v-icon>
                <v-icon v-else>mdi-weather-sunny</v-icon>
            </v-btn>
        </template>
        切换主题(明亮/暗黑)
    </v-tooltip>
</template>

<script>
import SETTINGS from '@/assets/app/settings';

let itemThemeDark = 'themeDark';

export default {
    methods: {
        onclickCallback: function () {
            this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
            SETTINGS.ui.setItem(itemThemeDark, this.$vuetify.theme.dark);
            SETTINGS.ui.save(itemThemeDark);
        }
    },
    created() {
        this.$vuetify.theme.dark = SETTINGS.ui.getItem(itemThemeDark).getValue();
    }

};


</script>