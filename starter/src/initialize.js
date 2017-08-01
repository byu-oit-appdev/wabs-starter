import {makeRequest} from './api/api'
import {reduxStore} from './redux/store'
import {fetchAPI, setUser} from './redux/actions'
import App from './components/App'

export default function () {
  console.log('initialize!')
  document.addEventListener('wabs-ready', () => {
    console.log('initialize ready!')
    const user = byu.user
    if (user) {
      reduxStore.dispatch(setUser({preferredFirstName: user.preferredFirstName, isLoggedIn: true}))
      makeRequest('').then(response => {
        return response.json()
      }).then(json => {
        reduxStore.dispatch(fetchAPI(json.contact))
      }).catch(err => {
        console.error('Error from api!\n', err)
      })
    } else {
      console.log('user not found!!')
    }
    App()
  })
}
