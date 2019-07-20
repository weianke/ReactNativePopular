import React, { Component } from 'react'
import {Provider} from 'react-redux'
import AppNavigator from './js/navigation/AppNavigator'
import store from './js/store'

export default class App extends Component {
  render() {
    return <Provider store={store}>
      <AppNavigator />
    </Provider>
  }
}