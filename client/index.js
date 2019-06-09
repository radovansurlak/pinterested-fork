import Vue from 'vue';
import Vuetify from 'vuetify';

import App from './app/App.vue';

import 'vuetify/dist/vuetify.min.css';

Vue.use(Vuetify);

new Vue(App).$mount('#app');
