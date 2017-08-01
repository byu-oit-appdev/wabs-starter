<template>
<span v-if="isLoggedIn" v-slot="'user-name'">{{userName}}</span>
</template>
<script>
import {revueStore} from 'store'
const store = revueStore
export default {
    name: 'UserInfo',
    data() {
        return {
            userName: this.$select('user.preferredFirstName as userName'),
            isLoggedIn: this.$select('user.isLoggedIn as isLoggedIn')
        }
    },
}
</script>
