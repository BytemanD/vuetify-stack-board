<template>

<v-dialog v-model="display" width="500">
    <v-card>
      <v-card-text>
        <br />
        <v-text-field disabled label="旧实例名" placeholder="旧实例名" v-model="dialog.server.name"></v-text-field>
        <v-text-field hide-details label="新实例名" placeholder="请输入新实例名" v-model="dialog.newName"></v-text-field>
      </v-card-text>
      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="warning" @click="commit()" :disabled="dialog.newName == ''">修改</v-btn>
      </v-card-actions>
    </v-card>
</v-dialog>

</template>
<script>
import i18n from '@/assets/app/i18n';
import { Utils } from '@/assets/app/lib';
import { ChangeServerNameDialog } from '@/assets/app/dialogs';

export default {
    props: {
        show: Boolean,
        server: Object,
    },
    data: () => ({
        i18n: i18n,
        Utils: Utils,
        display: false,
        dialog: new ChangeServerNameDialog(),
    }),
    methods: {
        commit: async function(){
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
            if(this.display){
              this.dialog.init(this.server);
            }
        },
        display(newVal) {
            this.display = newVal;
            this.$emit("update:show", this.display);
        }
    },
};
</script>