import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  StyleSheet,
  TouchableOpacity,
  View,
  DeviceInfo
} from 'react-native'
import { WebView } from 'react-native-webview'
import NavigationBar from '../common/NavigationBar'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import ViewUtil from '../util/UtilView'
import NavigationUti from '../navigation/NavigationUtil'
import FavoriteDao from '../expand/dao/FavoriteDao';
import BackPressComponent from '../common/BackPressComponent'

const THEME_COLOR = '#678'
export default class DetailPage extends Component {
  constructor(props) {
    super(props)
    this.params = this.props.navigation.state.params
    const { projectModel, flag} = this.params
    this.favoriteDao = new FavoriteDao(flag);
    this.url = projectModel.item.html_url
    const title = projectModel.item.fullName || projectModel.item.full_name
    this.state = {
      title: title,
      url: this.url,
      canGoBack: false,
      isFavorite: projectModel.isFavorite
    }
     this.backPress = new BackPressComponent({ backPress:() => this.onBackPress() })
  }

  componentDidMount() {
      this.backPress.componentDidMount()
   }

  componentWillUnmount() {
      this.backPress.componentWillUnmount()
   }

  onBackPress() {
    this.onBack()
    return true;
  }

  onBack() {
    if (this.state.canGoBack) {
      this.webView.goBack()
    } else {
      NavigationUti.goBack(this.props.navigation)
    }
  }

  onFavoriteButtonClick() {
    const { projectModel, callback } = this.params
    const isFavorite = projectModel.isFavorite = !projectModel.isFavorite;
    callback(isFavorite);  // 更新收藏状态
    this.setState({
      isFavorite: isFavorite
    });
    let key = projectModel.item.fullName ? projectModel.item.fullName : projectModel.item.id.toString();
    if (projectModel.isFavorite) {
      this.favoriteDao.saveFavoriteItem(key, JSON.stringify(projectModel.item))
    } else {
      this.favoriteDao.removeFavoriteItem(key);
    }
  }

  renderRightButton() {
    return (
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity onPress={() => this.onFavoriteButtonClick()}>
          <FontAwesome
            name={this.state.isFavorite ? 'star' : 'star-o'}
            size={20}
            style={{ color: 'white', marginRight: 10 }}
          />
        </TouchableOpacity>
        {ViewUtil.getShareButton(() => {})}
      </View>
    )
  }

  onNavigationStateChange(navState) {
    this.setState({
      canGoBack: navState.canGoBack,
      url: navState.url
    })
  }
  render() {
    console.log('url++++', this.state.url);
    const titleLayoutStyle = this.state.title.length > 20 ? { paddingRight: 30 } : null
    let navigationBar = (
      <NavigationBar
        title={this.state.title}
        titleLayoutStyle={titleLayoutStyle}
        leftButton={ViewUtil.getLeftBackButton(() => this.onBack())}
        style={{ backgroundColor: THEME_COLOR }}
        rightButton={this.renderRightButton()}
      />
    )
    return (
      <View style={styles.container}>
        {navigationBar}
        <WebView
          ref={webView => (this.webView = webView)}
          startInLoadingState={true}
          onNavigationStateChange={e => this.onNavigationStateChange(e)}
          source={{ uri: this.state.url }}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: DeviceInfo.isIPhoneX_deprecated ? 30 : 0
  }
})
