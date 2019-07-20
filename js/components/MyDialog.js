import React, { Component } from 'react'
import {
  View,
  Text,
  Button,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions
} from 'react-native'
import { Overlay, Toast } from 'teaset'
const { width, height } = Dimensions.get('window')


export default class ModalContent extends Component {
  constructor(props) {
    super(props)
    this.state = {
      text: '',
      TextColor: false
    }
  }

  render() {
    const { textColor } = this.props
    return (
      <View
        style={{
          backgroundColor: '#fff',
          width: 0.79 * width,
          height: 191,
          borderRadius: 8,
          alignItems: 'center'
        }}
      >
        <Text style={stylesContent.ModalText}>修改昵称</Text>

        <View>
          <TextInput
            style={{
              height: 44,
              width: 0.7 * width,
              borderColor: 'rgba(0,0,0,0.4)',
              borderWidth: StyleSheet.hairlineWidth,
              borderRadius: 8,
              marginLeft: 20,
              marginRight: 20,
              marginTop: -6,
              paddingLeft: 12,
              paddingRight: 12
            }}
            onChangeText={text => this.setState({ text })}
            value={this.state.text}
            maxLength={10}
            placeholder="取个好名字"
          />
        </View>
        <View style={{ marginTop: 5 }}>
          <Text
            style={{
              color: this.state.TextColor ? 'red' : '#666666',
              fontsSize: 14
            }}
          >
            可输入汉字、字母，限10个字
          </Text>
        </View>
        <View style={stylesContent.buttonContainer}>
          <TouchableOpacity
            onPress={() => this.props.onClose()}
            style={stylesContent.cancel}
          >
            <Text>取消</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={stylesContent.save}
            onPress={() => {
              let FilterName = /^[\u0391-\uFFE5A-Za-z]+$/
              if (!FilterName.test(this.state.text)) {
                this.setState({
                  TextColor: true
                })
                return
              } else {
                this.props.onGetData(this.state.text)
              }
            }}
          >
            <Text>保存</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

const stylesContent = StyleSheet.create({
  ModalText: {
    color: '#333333',
    fontSize: 16,
    flex: 1,
    alignItems: 'center',
    fontWeight: '500',
    marginTop: 20,
    overflow: 'hidden'
  },
  buttonContainer: {
    flex: 1,
    marginTop: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopColor: 'rgba(0, 0, 0, 0.2)',
    borderTopWidth: StyleSheet.hairlineWidth
  },
  cancel: {
    textAlign: 'center',
    flex: 1,
    height: 46,
    lineHeight: 46,
    borderRightColor: 'rgba(0, 0, 0, 0.2)',
    borderRightWidth: StyleSheet.hairlineWidth,
    fontSize: 16,
    color: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 8
  },
  save: {
    textAlign: 'center',
    flex: 1,
    height: 46,
    fontSize: 16,
    lineHeight: 46,
    color: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEC3D',
    borderBottomEndRadius: 8
  }
})
