<template>
<div>
    <h1>Welcome to your App</h1>
    <div v-if="api">
        <byu-card>
            <div class='margin-m'>
                <h3>Name</h3>
                <div>{{api.name}}</div>
                <h3>Email</h3>
                <div>{{api.email}}</div>
            </div>
        </byu-card>
    </div>
</div>
</template>
<script>
import {revueStore} from 'store'
const store = revueStore
export default {
    name: 'Home',
    data() {
        return {
            api: this.$select('api')
        }
    },
}
</script>
