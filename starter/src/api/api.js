import 'promise-polyfill'
import 'whatwg-fetch'

export function makeRequest (path) {
  const url = '/api/' + path
  return fetch(url, {credentials: 'same-origin'})
}
