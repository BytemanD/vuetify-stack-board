<template>
    <v-dialog v-model="display" width="800" scrollable>
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" density="compact" icon="mdi-folder-edit"></v-btn>
        </template>
        <v-card>
            <v-card-text>
                <v-data-table density='compact' :loading="table.loading" :headers="table.headers"
                    :items="table.items" :items-per-page="table.itemsPerPage" :search="table.search"
                    v-model="table.selected">
                </v-data-table>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>
<script>

import { ClusterTable } from '@/assets/app/tables.jsx';

export default {
    data: () => ({
        display: false,
        table: new ClusterTable()
    }),
    methods: {
    },
    created() {
        this.table.refresh()
    },
    // watch: {
    //     display(newVal) {
    //         this.display = newVal;
    //         this.$emit("update:show", this.display);
    //     }
    // },
};
</script>