<template>
    <v-tooltip location="bottom" text="切换明暗主题">
        <template v-slot:activator="{ props }">
            <v-btn icon v-on:click="onclickCallback()" v-bind="props">
                <v-icon v-if="theme.global.current.value.dark " icon="mdi-weather-night"></v-icon>
                <v-icon v-else icon="mdi-weather-sunny"></v-icon>
            </v-btn>
        </template>
        
    </v-tooltip>
</template>

<script setup>
import SETTINGS from '@/assets/app/settings';
import { useTheme } from 'vuetify'

const theme = useTheme()

let itemThemeDark = 'themeDark';

function onclickCallback() {
    theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark';
    SETTINGS.ui.setItem(itemThemeDark, theme.global.current.value.dark);
    SETTINGS.ui.save(itemThemeDark);
}

if (SETTINGS.ui.getItem(itemThemeDark).getValue()) {
    theme.global.name.value = 'dark';
} else {
    theme.global.name.value = 'light';
}

</script>