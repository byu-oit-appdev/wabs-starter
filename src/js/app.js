/**
 *  @license
 *    Copyright 2018 Brigham Young University
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 **/
'use strict';
import App from '../components/App';
import BYU from '../plugins/byu';
import router from '../router/router'
import store from '../store/index'
import Vue from 'vue'

import '../css/main.scss';

Vue.config.ignoredElements = [
    'byu-footer',
    'byu-footer-column',
    'byu-header',
    'byu-menu',
    'byu-search',
    'byu-user-info'
];

Vue.use(BYU, {
    search: {                   // remove search object to disable search
        autoSearch: false,
        autoSearchDelay: 300,
        callback: function(value) {
            console.log('Searched for ' + value)
        },
        value: ''
    }
});

window.app = new Vue({
    el: '#app',
    render: h => h(App),
    router,
    store
});