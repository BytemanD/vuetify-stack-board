<template>
<v-dialog v-model="display" width="600">
    <v-card>
      <v-card-title class="primary lighten-2" primary-title>添加Domain</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="10">
            <v-text-field label="*名字" placeholder="请输入Domain名" v-model="dialog.name"></v-text-field>
          </v-col>
          <v-col cols="2" class="my-auto">
            <v-btn text color="primary" @click="dialog.randomName()">随机名字</v-btn>
          </v-col>
        </v-row>
        <v-text-field label="描述" placeholder="请输入描述信息" v-model="dialog.description"></v-text-field>
        <v-switch hide-details class="my-auto" v-model="dialog.enabled"></v-switch>
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
        show: Boolean,
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
        show(newVal) {
            this.display = newVal;
            if (this.display) {
                this.dialog.init();
            }
        },
        display(newVal) {
            this.display = newVal;
            this.$emit("update:show", this.display);
        }
    },
};
</script>
