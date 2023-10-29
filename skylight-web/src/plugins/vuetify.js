/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'

import {
  VDataTable,
  VDataTableServer,
  VDataTableVirtual,
  VStepper, VStepperHeader, VStepperItem,
  VDatePicker,

} from 'vuetify/lib/labs/components.mjs'

import { VSnackbar } from "vuetify/lib/components/VSnackbar/VSnackbar.mjs";
import { VBtn } from "vuetify/lib/components/VBtn/VBtn.mjs";
import { VIcon } from "vuetify/lib/components/VIcon/VIcon.mjs";

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    themes: {
      light: {
        colors: {
          primary: '#1867C0',
          secondary: '#5CBBF6',
        },
      },
      dark: {
        colors: {
          primary: '#1867C0',
          secondary: '#5CBBF6',
        },
      },
    },
  },
  components: {
    VDataTable,
    VDataTableServer,
    VDataTableVirtual,
    VStepper, VStepperHeader, VStepperItem,
    VDatePicker,
    VSnackbar, VBtn, VIcon,
  }
})
