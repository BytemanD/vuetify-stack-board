<template>
    <v-card elevation="4">
        <v-card-title>配额</v-card-title>
        <v-divider></v-divider>
        <v-card-text>
            <v-row>
                <v-col cols="6">
                    <h4>计算</h4>
                    <v-list lines="one">
                        <v-list-item v-for="resource in card.resources" :key="resource">
                            <v-list-item-title>
                                {{ $t(resource) }}: {{ card[resource].used }}/ {{ card[resource].max }}
                            </v-list-item-title>
                            <v-list-item-subtitle>
                                <v-progress-linear rounded height="6" :model-value="card.percent(resource)"
                                    color="info"></v-progress-linear>
                            </v-list-item-subtitle>
                        </v-list-item>
                    </v-list>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>
  
<script setup>
import { reactive, ref } from 'vue';
import { LimitsCard } from '@/assets/app/tables';

var card = reactive(new LimitsCard())

card.refresh()

</script>