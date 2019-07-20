import React, { Component } from 'react'
import {
  createMaterialTopTabNavigator,
  createAppContainer
} from 'react-navigation'
import NavigationBar from '../common/NavigationBar'
import {
  View,
  Text,
  Button,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions
} from 'react-native'
import NavigationUti from '../navigation/NavigationUtil'
import Feather from 'react-native-vector-icons/Feather'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { Overlay, Toast } from 'teaset'
import ModalContent from '../components/MyDialog'
const { width, height } = Dimensions.get('window')
const THEME_COLOR = '#678'

export default class MyPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      name: 'anke'
    }
  }
  getLeftButton(callBack) {
    return (
      <TouchableOpacity
        style={{ padding: 8, paddingLeft: 12 }}
        onPress={callBack}
      >
        <Ionicons
          name={'ios-arrow-back'}
          size={26}
          style={{ color: 'white' }}
        />
      </TouchableOpacity>
    )
  }

  getRightButton() {
    return (
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity onPress={() => {}}>
          <View style={{ padding: 5, marginRight: 8 }}>
            <Feather name={'search'} size={24} style={{ color: 'white' }} />
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  getData(data) {
    console.log(data)
    // 接口请求成功后关闭弹出层， 并回显name
    this.overlayView.close()
  }

  showModal() {
    let overlayView = (
      <Overlay.View
        style={{
          backgroundColor: 'rgba(0,0,0,0.4)',
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center'
        }}
        modal={true}
        overlayOpacity={0}
        ref={v => (this.overlayView = v)}
      >
        <ModalContent
          onClose={() => {
            this.overlayView && this.overlayView.close()
          }}
          onGetData={data => this.getData(data)}
        />
      </Overlay.View>
    )
    Overlay.show(overlayView)
  }

  render() {
    let statusBar = {
      backgroundColor: THEME_COLOR,
      barStyle: 'light-content'
    }
    let navigationBar = (
      <NavigationBar
        title={'我的'}
        statusBar={statusBar}
        style={{ backgroundColor: THEME_COLOR }}
        rightButton={this.getRightButton()}
        leftButton={this.getLeftButton()}
      />
    )
    return (
      <View>
        {navigationBar}
        <Text>Mypage</Text>
        <Button title={this.state.name} onPress={() => this.showModal()} />
        <Text>{this.state.name}</Text>
        <Text
          onPress={() => {
            NavigationUti.goPage(
              {
                navigation: this.props.navigation
              },
              'DetailPage'
            )
          }}
        >
          跳转详情页
        </Text>
        <View>
          <Button
            title="跳转fetch页面"
            onPress={() => {
              NavigationUti.goPage(
                {
                  navigation: this.props.navigation
                },
                'FetchDemoPage'
              )
            }}
          />
        </View>
        <View style={{ marginTop: 10 }}>
          <Button
            title="跳转AsyncStorage页面"
            onPress={() => {
              NavigationUti.goPage(
                {
                  navigation: this.props.navigation
                },
                'AsyncStoragePage'
              )
            }}
          />
        </View>
        <View style={{ marginTop: 10 }}>
          <Button
            title="跳转DataStorage页面"
            onPress={() => {
              NavigationUti.goPage(
                {
                  navigation: this.props.navigation
                },
                'DataStoreDemo'
              )
            }}
          />
        </View>
        <TextInput
          style={{
            height: 44,
            borderColor: 'rgba(0,0,0,0.4)',
            borderWidth: 1,
            borderRadius: 8,
            marginLeft: 20,
            marginRight: 20
          }}
          onChangeText={text => this.setState({ text })}
          value={this.state.text}
          placeholder="取个好名字"
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 30
  },
  about_left: {
    alignItems: 'center',
    flexDirection: 'row'
  },
  item: {
    backgroundColor: 'white',
    padding: 10,
    height: 90,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  groupTitle: {
    marginLeft: 10,
    marginTop: 10,
    marginBottom: 5,
    fontSize: 12,
    color: 'gray'
  }
})

// class ModalContent extends Component {
//   constructor(props) {
//     super(props)
//     this.state = {
//       text: '',
//       TextColor: false
//     }
//   }

//   render() {
//     const { textColor } = this.props
//     return (
//       <View
//         style={{
//           backgroundColor: '#fff',
//           width: 0.79 * width,
//           height: 191,
//           borderRadius: 8,
//           alignItems: 'center'
//         }}
//       >
//         <Text style={stylesContent.ModalText}>修改昵称</Text>

//         <View>
//           <TextInput
//             style={{
//               height: 44,
//               width: 0.7 * width,
//               borderColor: 'rgba(0,0,0,0.4)',
//               borderWidth: 1,
//               borderRadius: 8,
//               marginLeft: 20,
//               marginRight: 20,
//               marginTop: -6,
//               paddingLeft: 12,
//               paddingRight: 12
//             }}
//             onChangeText={text => this.setState({ text })}
//             value={this.state.text}
//             placeholder="取个好名字"
//           />
//         </View>
//         <View style={{ marginTop: 5 }}>
//           <Text
//             style={{
//               color: this.state.TextColor ? 'red' : '#666666',
//               fontsSize: 14
//             }}
//           >
//             可输入汉字、字母及数字，限20个字
//           </Text>
//         </View>
//         <View style={stylesContent.buttonContainer}>
//            <TouchableOpacity 
//                 onPress={() => this.props.onClose()}
//                 style={stylesContent.cancel}>
//               <Text>取消</Text>
//           </TouchableOpacity>
//           <TouchableOpacity  
//             style={stylesContent.save}
//             onPress={() => {
//               let FilterName = /^[A-Za-z0-9\u4e00-\u9fa5]+$/;
//               if (!FilterName.test(this.state.text)) {
//                 this.setState({
//                   TextColor: true
//                 })
//                 return
//               } else {
//                 this.props.onGetData(this.state.text)
//               }
//             }}
//             ><Text>保存</Text></TouchableOpacity>
//         </View>
//       </View>
//     )
//   }
// }

// const stylesContent = StyleSheet.create({
//   ModalText: {
//     color: '#333333',
//     fontSize: 16,
//     flex: 1,
//     alignItems: 'center',
//     fontWeight: '500',
//     marginTop: 20,
//     overflow: 'hidden'
//   },
//   buttonContainer: {
//     flex: 1,
//     marginTop: 17,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderTopColor: 'rgba(0, 0, 0, 0.2)',
//     borderTopWidth: 1
//   },
//   cancel: {
//     textAlign: 'center',
//     flex: 1,
//     height: 46,
//     lineHeight: 46,
//     borderRightColor: 'rgba(0, 0, 0, 0.2)',
//     borderRightWidth: 1,
//     fontSize: 16,
//     color: '#333333',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderBottomLeftRadius: 8
//   },
//   save: {
//     textAlign: 'center',
//     flex: 1,
//     height: 46,
    
//     fontSize: 16,
//     lineHeight: 46,
//     color: '#333333',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#FFEC3D',
//     borderBottomEndRadius: 8
//   }
// })
