import Home from './Home.vue'
import Info from './Info.vue'
import About from './About.vue'
import VueRouter from 'vue-router'

const routes = [
    { path: '/', redirect: '/home' },
    { path: '/home', component: Home },
    { path: '/info', component: Info },
    { path: '/about', component: About }
]

export default new VueRouter({
  mode: 'history',
  routes
})
