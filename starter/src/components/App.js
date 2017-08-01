import router from './routes'
import Vue from 'vue'
import VueRouter from 'vue-router'
import UserInfo from './UserInfo.vue'

Vue.use(VueRouter)

Vue.config.ignoredElements = [
  'byu-header', 'byu-user-info', 'byu-menu', 'byu-footer', 'byu-card'
]

Vue.directive('slot', {
  inserted (el, binding) {
    el.setAttribute('slot', binding.value)
  },
  componentUpdated (el, binding) {
    el.setAttribute('slot', binding.value)
  }
})

Vue.component('user-info', UserInfo)

export default function init () {
  new Vue({
    router
  }).$mount('#app')
}
