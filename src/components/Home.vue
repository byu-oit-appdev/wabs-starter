<template>
    <div>
        <h2>Home Page</h2>
        <p>This is the home page</p>
    </div>
</template>

<script>
    export default {

        // define a new navigation when this page is loaded
        byuNavigation(selected, links) {
            return [
                { href: '/', title: 'Home' },
                { href: '/link-2', title: 'Link 2' },
                { href: '/link-3', title: 'Link 3' },
                { href: '/link-4', title: 'Link 4' },
                { href: '/link-5', title: 'Link 5' },
                { href: '/link-6', title: 'Link 6' }
            ]
        }
    }
</script>

<style scoped>
    p {
        font-weight: bold;
        color: orange;
    }

</style>