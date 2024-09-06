import { createApp } from 'vue';
import { pinia } from './store';
import { router } from './router';

import App from './App.vue';

import './index.css';
import 'normalize.css';
import 'virtual:uno.css';
import './style/plyr-custom.css';

const app = createApp(App);

app.use(pinia);
app.use(router);

app.mount('#app');
