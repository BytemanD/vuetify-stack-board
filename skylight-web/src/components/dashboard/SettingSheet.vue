<template>
    <v-dialog v-model="display" fullscreen>
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon="mdi-cog"></v-btn>
        </template>
        <v-card>
            <v-toolbar color="primary" density="compact">
                <v-toolbar-title>{{ $t('setting') }}</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-toolbar-items>
                    <v-btn icon="mdi-close" @click="display = false"></v-btn>
                </v-toolbar-items>
            </v-toolbar>
            <v-card-text>
                <v-col>
                    <v-tabs v-model="tab" show-arrows selected-class="bg-blue" slider-color="blue" density="compact">
                        <v-tab v-for="group in SETTINGS" :value="group.name" :key="group.name">
                            <strong>{{ $t(group.name) }}</strong>
                        </v-tab>
                    </v-tabs>
                    <div class="bg-blue" style="height: 2px;"></div>
                </v-col>
                <v-window v-model="tab" class="px-10">
                    <v-window-item v-for="group in SETTINGS" :value="group.name" :key="group.name">
                        <v-row>
                            <v-col cols="12" lg="3" v-for="(item, key) in group.items" v-bind:key="key">
                                <v-select v-if="item.choises" density='compact' outlined v-bind:key="key"
                                    :label="$t(key)" :items="item.choises" v-model="item.value" hide-details>
                                </v-select>
                                <v-switch v-else-if="item.type == Boolean" color="info" density='compact'
                                    class="ml-2" :label="$t(key)" v-model="item.value"></v-switch>
                                <div v-else-if="item.type == 'label'" style="width: 4000;">
                                    {{ $t(key) }}:
                                    <v-chip density='compact' color="info">{{ item.value }}</v-chip>
                                </div>
                                <v-text-field outlined density='compact' v-else :label="$t(key)"
                                    v-model="item.value">
                                </v-text-field>
                            </v-col>
                        </v-row>
                    </v-window-item>
                </v-window>
            </v-card-text>
            <v-card-actions>
                <v-alert variant="text" density='compact' type="warning">{{ $t('refreshAfterChanged') }}</v-alert>
                <v-alert variant="text" density='compact' :type="alert.type" v-if="alert.message">
                    {{ alert.message }}
                </v-alert>
                <v-btn color="warning" @click="reset()">{{ $t('reset') }}</v-btn>
                <v-btn color="primary" @click="save()">{{ $t('save') }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
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
        version: null,
        tab: 'option-1',
        alert: {
            message: '',
            type: 'success'
        }
    }),
    methods: {
        getVersion: async function () {
            this.version = await (API.version.get());
            this.SETTINGS.updateVersion(this.version)
        },
        save: function () {
            this.SETTINGS.save()
            this.alert = { message: '配置保存成功', type: 'success' }
            let self = this;
            setTimeout(() => {
                self.alert.message = "";
            }, 2000)
        },
        reset: function () {
            this.SETTINGS.reset()
            this.alert = { message: '配置重置成功', type: 'success' }
            let self = this;
            setTimeout(() => {
                self.alert.message = "";
            }, 2000)
        }
    },
    created() {
        this.getVersion();
    },
    watch: {
        display(newVal) {
            this.display = newVal;
            this.$emit("update:show", this.display);
        }
    },
}
</script>