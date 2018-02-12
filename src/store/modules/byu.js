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
export default {
    state: {
        title: 'Your Site Title',
        navigation: null
    },
    mutations: {
        siteLinks (state, links) {
            if (JSON.stringify(state.navigation) !== JSON.stringify(links)) {
                // set nav to null prior update to refresh the byu-menu component
                state.navigation = null;
                if (links) setTimeout(() => state.navigation = links, 0);
            }
        },
        siteTitle (state, value) {
            state.title = value;
            document.querySelector('title').innerText = value;
        }
    }
};