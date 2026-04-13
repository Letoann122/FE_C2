import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Admin from './layout/wrapper/Admin/index.vue'
import Client from './layout/wrapper/Client/index.vue'
import Blank from './layout/wrapper/blank.vue'
import Hospital from './layout/wrapper/Hospital/index.vue'
// import 'bootstrap/dist/css/bootstrap.min.css'
// import 'bootstrap/dist/js/bootstrap.bundle.min.js'     
import "../src/assets/css/bootstrap.min.css"
import "../src/assets/js/bootstrap.bundle.min.js"
import Toaster from '@meforma/vue-toaster'


const app = createApp(App)
app.use(Toaster, { position: 'top-right' })
app.use(router)
app.component('client-layout', Client)
app.component('admin-layout', Admin)
app.component('blank-layout', Blank)
app.component('Hospital-layout', Hospital)
app.mount('#app')

