import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';
import { VSnackbar, VBtn, VIcon } from "vuetify/lib";

Vue.use(Vuetify);

// Add is code to fix error: Unknown custom element: <v-snackbar> <v-icon> ...
Vue.component("v-snackbar", VSnackbar);
Vue.component("v-btn", VBtn);
Vue.component("v-icon", VIcon);

export default new Vuetify({
});
