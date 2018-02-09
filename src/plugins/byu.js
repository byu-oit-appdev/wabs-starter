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
    install: function (Vue, options) {
        let timeoutId;

        if (!options) options = {};
        if (!options.search) options.search = {};
        if (!options.hasOwnProperty('autoSearch')) options.autoSearch = false;
        if (!options.hasOwnProperty('autoSearchDelay')) options.autoSearchDelay = 300;
        if (!options.search.value) options.search.value = '';

        const searchEnabled = options.search.callback;
        let searchElement;

        function search(value, submitted) {
            clearTimeout(timeoutId);
            if (submitted) {
                options.search.callback(search.value, true);

            } else if (options.autoSearch) {
                setTimeout(() => {
                    options.search.callback(search.value, false);
                }, options.autoSearchDelay);
            }
        }

        Object.defineProperty(search, 'value', {
            get: function() {
                return searchElement ? searchElement.value : '';
            },
            set: function(value) {
                if (searchElement && searchElement.value !== value) searchElement.value = value;
            }
        });

        // expose the $byu object to all components
        Object.defineProperty(Vue.prototype, '$byu', {
            get () {
                return searchEnabled ? Object.assign({ search }, window.byu) : window.byu;
            }
        });

        (function() {
            const intervalId = setInterval(function() {
                searchElement = document.querySelector('#byuSiteSearch');
                if (searchElement) {
                    clearInterval(intervalId);
                    searchElement.value = options.search.value;
                    searchElement.addEventListener('keyup', function() {
                        search(searchElement.value, false);
                    });
                }
            }, 100);
        })();
    }
}