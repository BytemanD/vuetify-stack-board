<template>
    <v-sheet>
        <v-row class="pa-4">
            <v-col cols="12" lg="2" md="3" sm="12" class="text-center">
                <h4>UI</h4>
                <v-divider class="mb-4"></v-divider>
                <template v-for="(item, key) in SETTINGS.ui.items" >
                    <v-select dense outlined v-bind:key="key" v-if="item.choises" :label="I18N.t(key)" :items="item.choises"
                        v-model="item.value" v-on:change="item.onChange(item.value)">
                    </v-select>
                    <v-switch class="ma-0" dense v-if="item.type == Boolean" v-bind:key="key" :label="I18N.t(key)"
                        v-model="item.value" v-on:change="item.onChange(item.value)"></v-switch>
                </template>
            </v-col>
            <v-col cols="12" lg="2" md="3" sm="12" class="text-center">
                <h4>Openstack</h4>
                <v-divider class="mb-4"></v-divider>
                <template v-for="(item, key) in SETTINGS.openstack.items" >
                    <v-select dense outlined v-bind:key="key" v-if="item.choises" :label="I18N.t(key)" :items="item.choises"
                        v-model="item.value" v-on:change="item.onChange(item.value)">
                    </v-select>
                    <v-text-field v-if="item.type == true" v-bind:key="key" :label="I18N.t(key)" v-model="item.value"
                        v-on:change="item.onChange(item.value)">
                    </v-text-field>
                </template>
            </v-col>
            <v-col cols='12' class="text-right">
                <v-btn class="mr-1" color="primary" @click="SETTINGS.save()">{{ I18N.t('save') }}</v-btn>
                <v-btn color="warning" @click="SETTINGS.reset()">{{ I18N.t('reset') }}</v-btn>
            </v-col>
        </v-row>
    </v-sheet>
</template>
  
<script>
import I18N from '@/assets/app/i18n';
import SETTINGS from '@/assets/app/settings';

export default {
    progs: {
        show: Boolean,
    },
    data: () => ({
        display: false,
        I18N: I18N,
        SETTINGS: SETTINGS
    }),
    methods: {

    },
    created() {

    },
    watch: {
        show(newVal) {
            console.log('1111111111', newVal)
            console.log('1111111111', this.display)
            this.display = newVal;
        },
        display(newVal) {
            console.log('222222222', newVal)
            this.display = newVal;
            this.$emit("update:show", this.display);
        }
    },
}
</script>
  