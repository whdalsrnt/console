import Vue from 'vue';
import VueCompositionApi from '@vue/composition-api';
import router from '@/routes/index';
import { store } from '@/store';
import directive from '@/directives';
import { i18n } from '@/translations';
import Fragment from 'vue-fragment';
import VTooltip from 'v-tooltip';
import SpaceDesignSystem from '@spaceone/design-system';
import PortalVue from 'portal-vue';
import { siteInit } from '@/lib/site-initializer';
import App from './App.vue';

import '@/styles/style.pcss';
import '@spaceone/design-system/css/light-style.css';

/** ********** SET VUE PLUGINS ************** */
Vue.use(VueCompositionApi);
// @ts-ignore
Vue.use(Fragment.Plugin);
Vue.use(VTooltip, { defaultClass: 'p-tooltip', defaultBoundariesElement: document.body });
Vue.use(PortalVue);

directive(Vue);

Vue.use(SpaceDesignSystem);


(async () => {
    await siteInit();

    new Vue({
        el: '#app',
        router,
        i18n,
        store,
        components: {
            App,
        },
        template: '<App/>',
    });
})();
