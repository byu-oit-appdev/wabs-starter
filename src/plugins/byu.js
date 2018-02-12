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

        // normalize options
        if (!options) options = {};


        //////////////////////////////
        //                          //
        //       SET UP SEARCH      //
        //                          //
        //////////////////////////////

        if (!options.search) options.search = {};
        if (!options.hasOwnProperty('autoSearch')) options.autoSearch = false;
        if (!options.hasOwnProperty('autoSearchDelay')) options.autoSearchDelay = 300;
        if (!options.search.value) options.search.value = '';

        const searchEnabled = options.search.callback;
        let searchElement;

        // define search event handler
        function search(value, submitted) {
            if (arguments.length < 1) value = search.value;
            if (arguments.length < 2) submitted = true;

            clearTimeout(timeoutId);
            if (submitted) {
                options.search.callback(value, true);

            } else if (options.autoSearch) {
                setTimeout(() => {
                    options.search.callback(value, false);
                }, options.autoSearchDelay);
            }
        }

        // define search value getter / setter
        Object.defineProperty(search, 'value', {
            get: function() {
                return searchElement ? searchElement.value : '';
            },
            set: function(value) {
                if (searchElement && searchElement.value !== value) searchElement.value = value;
            }
        });

        // initialize site search
        if (searchEnabled) {
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
        }



        ///////////////////////////////////////////
        //                                       //
        //       Add $byu to each component      //
        //                                       //
        ///////////////////////////////////////////

        // expose the $byu object to all components
        Object.defineProperty(Vue.prototype, '$byu', {
            get () {
                const site = {};
                const store = this.$store;

                Object.defineProperties(site, {
                    navigation: {
                        get: () => {
                            const links = store.state.byu.navigation;
                            return links ? links.map(v => Object.assign({}, v)) : null
                        },
                        set: links => store.commit('siteLinks', links)
                    },

                    title: {
                        get: () => store.state.byu.title,
                        set: title => store.commit('siteTitle', title)
                    }
                });

                const result = {
                    site,
                    user: window.byu.user
                };
                if (searchEnabled) result.search = search;
                return Object.assign(result, window.byu);
            }
        });



        ///////////////////////////////////////////
        //                                       //
        //      Update site navigation mixin     //
        //                                       //
        ///////////////////////////////////////////

        Vue.mixin({

            // if component has byuNavigation property then update nav
            beforeRouteEnter(to, from, next) {
                next(vm => routeEnter(vm, vm.$route));
            },

            // if component has byuNavigation property then update nav
            beforeRouteUpdate(to, from, next) {
                routeEnter(this, to);
                next();
            }
        });
    }
}

function findMatchingNavigationItem(items, path) {
    if (!items) return undefined;
    return items.filter(link => link.href === path.fullPath)[0];
}

function routeEnter(vm, to) {
    const links = vm.$byu.site.navigation;
    const match = findMatchingNavigationItem(links, to);

    const nav = vm.$options.byuNavigation;
    if (typeof nav === 'function') vm.$byu.site.navigation = nav(match, links);

    const title = vm.$options.byuTitle;
    if (typeof title === 'function') vm.$byu.site.title = title(match);
}