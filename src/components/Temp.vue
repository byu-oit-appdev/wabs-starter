<template>
    <div>
        <h2>{{title}}</h2>
        <p>This is not the home page.</p>
    </div>
</template>

<script>
    export default {

        // define a new navigation when router loads this component
        byuNavigation(selected, links) {
            const results = [
                { href: '/', title: 'Home' },
                { href: '/sub-page-1', title: 'Sub Page 1' },
                { href: '/sub-page-2', title: 'Sub Page 2' }
            ];

            // dynamic second link
            if (selected) results.splice(1, 0, { href: selected.path, title: selected.title });
            return results;
        },
        computed: {
            title() {
                return this.$route.params.title;
            }
        }
    }
</script>

<style scoped>

</style>