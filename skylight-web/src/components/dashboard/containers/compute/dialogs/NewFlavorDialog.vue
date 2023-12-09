<template>
  <v-dialog v-model="display" width="900" scrollable>
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" icon="mdi-plus" fab color="primary" class="mr-1"></v-btn>
    </template>

    <v-card>
      <v-card-title>新建规格</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="6">
            <v-text-field label="名字" placeholder="请输入规格名" v-model="dialog.params.name" :error="!dialog.params.name"
              :rules="[dialog.checkNameNotNull]"></v-text-field>
          </v-col>
          <v-col cols="6">
            <v-text-field label="ID" placeholder="请输入规格ID" v-model="dialog.params.id"></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-text-field type="number" label="内存(MB)" v-model="dialog.params.ram" prepend-icon="mdi-minus"
              append-icon="mdi-plus" @click:prepend="dialog.ramMinus()"
              @click:append-outer="dialog.ramPlus()"></v-text-field>
            <v-text-field type="number" label="CPU个数" v-model="dialog.params.vcpu" prepend-icon="mdi-minus"
              append-icon="mdi-plus" @click:prepend="dialog.vcpuMinus()"
              @click:append-outer="dialog.vcpuPlus()"></v-text-field>
            <v-text-field type="number" label="磁盘(GB)" v-model="dialog.params.disk" prepend-icon="mdi-minus"
              append-icon="mdi-plus" @click:prepend="dialog.diskMinus()"
              @click:append-outer="dialog.diskPlus()"></v-text-field>
            <v-switch hide-details density='compact' v-model="dialog.params.isPublic" label="设为共享"></v-switch>
          </v-col>
          <v-col cols="8">
            <v-textarea rows="8" filled label="设置规格属性" placeholder="请输入规格的属性,例如: hw:page_size=large, 多个属性换行输入。"
              v-model="dialog.params.extrasContent" :rules="[dialog.checkExtrasValid]"></v-textarea>
          </v-col>
        </v-row>
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
import i18n from '@/assets/app/i18n';
import { NewFlavorDialog } from '@/assets/app/dialogs';
import { Utils } from '@/assets/app/lib';

export default {
  props: {

  },
  data: () => ({
    i18n: i18n,
    display: false,
    dialog: new NewFlavorDialog(),
    Utils: Utils
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
      this.display = newVal;
      this.$emit("update:show", this.display);
    }
  },
};
</script>