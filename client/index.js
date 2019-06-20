import Vue from 'vue';
import SocialSharing from 'vue-social-sharing';

import Vuetify, {
  VApp, // required
  VBtn,
  VSelect,
  VForm,
  VTextField,
} from 'vuetify/lib';

import App from './app/App.vue';

import 'vuetify/dist/vuetify.min.css';

Vue.use(SocialSharing);
Vue.use(Vuetify, {
  components: {
    VApp,
    VBtn,
    VSelect,
    VForm,
    VTextField,
  },
});

new Vue(App).$mount('#app');
