import {createStore, combineReducers} from 'redux'
import Vue from 'vue'
import Revue from 'revue'
import initialState from './initialState'
import * as reducers from './reducers'
import * as actions from './actions'

const reduxStore = createStore(combineReducers(reducers), initialState)
const revueStore = new Revue(Vue, reduxStore, actions)

export {reduxStore, revueStore}
