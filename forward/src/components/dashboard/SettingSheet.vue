<template>
    <v-sheet>
        <v-row class="pa-4">
            <template v-for="group in SETTINGS">
                <v-col cols="12" lg="2" md="3" sm="12" class="text-center" v-bind:key="group.name">
                    <h4 class="info--text">{{ I18N.t(group.name) }}</h4>
                    <v-divider class="mb-4"></v-divider>
                    <template v-for="(item, key) in group.items">
                        <v-select dense outlined class="my-0" v-bind:key="key" v-if="item.choises" :label="I18N.t(key)" :items="item.choises"
                            v-model="item.value" v-on:change="group.save(item.value)">
                        </v-select>
                        <v-switch class="my-0" dense v-else-if="item.type == Boolean" v-bind:key="key" :label="I18N.t(key)"
                            v-model="item.value" v-on:change="group.save(key)"></v-switch>
                        <v-text-field outlined dense v-else v-bind:key="key" :label="I18N.t(key)" v-model="item.value"
                            v-on:change="group.save(key)">{{ item.value }}</v-text-field>
                    </template>
                </v-col>
            </template>
            <v-col cols='12' class="pt-0">
                <v-row>
                    <v-col>
                        <v-alert text dense type="info">版本: {{ version }}</v-alert>
                        
                    </v-col>
                    <v-col cols="4">
                        <v-alert text dense type="warning">{{ I18N.t('refreshAfterChanged') }}</v-alert>
                        <v-col cols='12' class="text-right pt-0">
                            <v-btn class="mr-1" color="primary" @click="SETTINGS.save()">{{ I18N.t('save') }}</v-btn>
                            <v-btn color="warning" @click="SETTINGS.reset()">{{ I18N.t('reset') }}</v-btn>
                        </v-col>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </v-sheet>
</template>
  
<script>
import API from '@/assets/app/api';
import I18N from '@/assets/app/i18n';
import SETTINGS from '@/assets/app/settings';

export default {
    progs: {
        show: Boolean,
    },
    data: () => ({
        display: false,
        I18N: I18N,
        SETTINGS: SETTINGS,
        version: null
    }),
    methods: {
        getVersion: async function () {
            this.version = await (API.version.get());
        },
    },
    created() {
        this.getVersion();
    },
    watch: {
        show(newVal) {
            this.display = newVal;
        },
        display(newVal) {
            this.display = newVal;
            this.$emit("update:show", this.display);
        }
    },
}
</script>
  