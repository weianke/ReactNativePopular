import React, { Component } from 'react';
import { View, Text, Button, DeviceInfo } from 'react-native'
import { connect } from 'react-redux'
import actions from './../action/index'


class FavoritePage extends Component {
  render() {
    return (
      <View style={{flex: 1, marginTop: 30}}>
        <Text>收藏页面</Text>
         <Button title="改变主题色" onPress={()=> {
            this.props.onThemeChange('red')
        }}/>
      </View>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  onThemeChange: theme => dispatch(actions.onThemeChange(theme))
})

export default connect(null, mapDispatchToProps)(FavoritePage)
