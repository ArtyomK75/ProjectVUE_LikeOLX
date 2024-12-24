import './assets/main.css'
import router from "@/router/index.js";

import { createApp } from 'vue';
import App from './App.vue';
import 'bootstrap/dist/css/bootstrap.min.css';

import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css';

import { createPinia } from 'pinia';
const pinia = createPinia();

const vuetify = createVuetify ({
    components,
    directives,
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
            mdi,
        },
    },
});

const app = createApp(App)
    .use(vuetify)
    .use(pinia)
    .use(router);

app.mount('#app');
