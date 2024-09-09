import { createApp } from 'vue';
import { i18n } from './lang';
import { pinia } from './store';
import { router } from './router';

import App from './App.vue';

import './index.css';
import 'normalize.css';
import 'virtual:uno.css';
import './style/plyr-custom.css';
import './style/asciinema-custom.css';

const app = createApp(App);

app.use(i18n);
app.use(pinia);
app.use(router);

app.mount('#app');
