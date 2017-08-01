export function changeEmail (email) {
  return {
    type: 'CHANGE_EMAIL',
    payload: email
  }
}

export function changeName (name) {
  return {
    type: 'CHANGE_NAME',
    payload: name
  }
}

export function fetchAPI (results) {
  return {
    type: 'FETCH_API',
    payload: results
  }
}

export function setUser (user) {
  return {
    type: 'SET_USER',
    payload: user
  }
}

export function removeUser () {
  return {
    type: 'REMOVE_USER'
  }
}
