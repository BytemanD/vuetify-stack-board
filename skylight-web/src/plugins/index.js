/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

// Plugins
import vuetify from './vuetify'
import router from '../router'
import I18n from '../assets/app/i18n.js'

import notifications from '@websitevirtuoso/vue3-v-snackbars'


export function registerPlugins (app) {
  app
  .use(vuetify)
  .use(router)
  .use(I18n)
  .use(notifications, { componentName: 'vNotifications', name: 'notify'})
}
