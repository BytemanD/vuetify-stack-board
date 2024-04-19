<template>
  <image-table editable />
</template>

<script>
import { ImageDataTable } from '@/assets/app/tables';

import ImageTable from '@/components/plugins/tables/ImageTable.vue';

export default {
  components: {
    ImageTable,
  },

  data: () => ({
    table: new ImageDataTable(),
  }),
  methods: {

  },
  created() {

  }
};
</script>
