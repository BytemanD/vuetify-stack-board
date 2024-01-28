<template>
    <v-col>
        <migration-table :table="table" refresh-btn />
    </v-col>
</template>

<script>
import { MigrationDataTable } from '@/assets/app/tables.jsx';
import { Utils } from '@/assets/app/lib.js';
import MigrationTable from '@/components/plugins/tables/MigrationTable.vue';

export default {
    components: {
        MigrationTable
    },
    data: () => ({
        Utils: Utils,
        table: new MigrationDataTable()
    }),
    created() {
        this.table.refresh();
    }
};
</script>
