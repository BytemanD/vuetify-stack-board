<template>
  <v-dialog v-model="display" width="600">
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" icon="mdi-plus" fab color="primary" class="mr-1"></v-btn>
    </template>
    <v-card>
      <v-card-title class="primary lighten-2" primary-title>添加Domain</v-card-title>
      <v-card-text>
        <v-text-field label="*名字" placeholder="请输入Domain名" v-model="dialog.name">
          <template v-slot:append>
            <v-btn variant="text" color="primary" @click="dialog.randomName()">随机名字</v-btn>
          </template>
        </v-text-field>
        <v-text-field label="描述" hide-details placeholder="请输入描述信息" v-model="dialog.description"></v-text-field>
        <v-switch hide-details class="my-auto" v-model="dialog.enabled" label="启用" color="info"></v-switch>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="commit()">创建</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { NewDomainDialog } from '@/assets/app/dialogs';

export default {
  props: {
  },
  data: () => ({
    display: false,
    dialog: new NewDomainDialog(),
  }),
  methods: {
    commit: async function () {
      await this.dialog.commit()
      this.display = false;
      this.$emit('completed');
    }
  },
  created() {

  },
  watch: {
    display(newVal) {
      if (this.display) {
        this.dialog.init();
      }
      this.display = newVal;
      this.$emit("update:show", this.display);
    }
  },
};
</script>
