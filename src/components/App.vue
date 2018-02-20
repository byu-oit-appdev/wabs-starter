<template>
    <div id="app">
        <byu-header constrain-top-bar>
            <h1 slot="site-title">{{$store.state.byu.title}}</h1>

            <!-- site search -->
            <byu-search slot="search" placeholder="Search" v-if="$byu.search">
                <form method="get" @submit.prevent="$byu.search($byu.search.value, true)">
                    <input type="search" name="search" id="byuSiteSearch">
                </form>
            </byu-search>

            <!-- user login / logout -->
            <byu-user-info slot="user" login-url="#login">
                <a slot="login" href="#" @click.prevent="$byu.auth.login()">Sign In</a>
                <a slot="logout" href="#" @click.prevent="$byu.auth.logout()">Sign Out </a>
                <span slot="user-name" v-if="$byu.user">{{$byu.user.preferredFirstName}}</span>
            </byu-user-info>

            <!-- show navigation if there are links -->
            <byu-menu slot="nav" v-if="hasNavigation">
                <a :href="link.href" @click.prevent="navigate(link, $router)"
                   :class="{ active: link.href === $route.path }"
                   v-for="link in links">{{link.title}}</a>
            </byu-menu>
        </byu-header>

        <div id="content-area">
            <router-view></router-view>
        </div>

        <byu-footer></byu-footer>
    </div>
</template>

<script>
    const rxLink = /^(https?:)\/\/([\s\S]+?)(?:\:(\d+))?(?:\/|$)/;

    export default {
        computed: {
            hasNavigation() {
                return this.links && this.links.length > 0;
            },
            links() {
                return this.$store.state.byu.navigation;
            }
        },
        methods: {
            navigate(link) {
                if (link.callback) {
                    link.callback.call(this, link);

                } else if (link.href) {
                    const loc = window.location;
                    const match = rxLink.exec(link.href);
                    const notPushable = match
                        ? loc.protocol !== match[1]
                            || (loc.host || loc.hostname) !== match[2]
                            || loc.port !== (match[3] || '')
                        : false;

                    if (notPushable) {
                        window.location = link.href;
                    } else {
                        this.$router.push(link.href);
                    }
                }
            }
        }
    }
</script>

