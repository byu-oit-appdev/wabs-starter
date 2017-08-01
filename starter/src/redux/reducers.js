export function api (state = {}, action) {
  switch (action.type) {
    case 'CHANGE_EMAIL':
      return Object.assign({}, state, {email: action.payload})
    case 'CHANGE_NAME':
      return Object.assign({}, state, {name: action.payload})
    case 'FETCH_API':
      return Object.assign({}, state, action.payload)
    default:
      return state
  }
}

export function user (state = {}, action) {
  switch (action.type) {
    case 'SET_USER':
      return Object.assign({}, state, action.payload)
    case 'REMOVE_USER':
      return Object.assign({})
    default:
      return state
  }
}
