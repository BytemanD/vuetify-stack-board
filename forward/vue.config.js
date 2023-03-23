
const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  // devServer: {
  //   proxy: {
  //     '/': {
  //       target: 'localhost:8080/',
  //       changeOrigin: true,
  //       ws: false,
  //     }
  //   }
  // },
  assetsDir: './static',
  pages: {
    welcome: {
      entry: './src/components/welcome/welcome.js',
      template: './public/welcome.html',
      title: 'welcome',
      filename: 'welcome.html'
    },
    dashboard: {
      entry: './src/components/dashboard/dashboard.js',
      template: './public/dashboard.html',
      title: 'dasboard',
      filename: 'dashboard.html'
    }
  },
  transpileDependencies: [
    'vuetify'
  ],
})
