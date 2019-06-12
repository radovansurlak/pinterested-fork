import Vue from 'vue';
import Vuetify from 'vuetify';
import SocialSharing from 'vue-social-sharing';

import App from './app/App.vue';

import 'vuetify/dist/vuetify.min.css';

Vue.use(SocialSharing);
Vue.use(Vuetify);

new Vue(App).$mount('#app');
