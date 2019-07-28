import React, { Component } from 'react'
import {
  createMaterialTopTabNavigator,
  createAppContainer
} from 'react-navigation'
import {
  FlatList,
  RefreshControl,
  View,
  Text,
  Button,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  DeviceInfo
} from 'react-native'
import Toast from 'react-native-easy-toast'
import { connect } from 'react-redux'
import FavoriteDao from '../expand/dao/FavoriteDao'
import { FLAG_STORAGE } from '../expand/dao/DataStore'
import actions from '../action/index'
import NavigationUti from '../navigation/NavigationUtil'
import NavigationBar from '../common/NavigationBar'
import PopularItem from '../common/PopularItem'
import FavoriteUtil from '../util/FavoriteUtil';

const URL = 'https://api.github.com/search/repositories?q='
const QUERY_STR = '&sort=stars'
const THEME_COLOR = '#678'
const favoriteDao = new FavoriteDao(FLAG_STORAGE.flag_popular)
class PopularPage extends Component {
  constructor(props) {
    super(props)
    this.tabNames = ['java', 'Android', 'iOS', 'React', 'React Native', 'PHP']
  }

  _getTabs() {
    const tabs = {}
    const { theme } = this.props
    this.tabNames.forEach((item, index) => {
      tabs[`tab${index}`] = {
        screen: props => <PopularTabPage {...props} tabLabel={item} />,
        navigationOptions: {
          title: item
        }
      }
    })
    return tabs
  }

  render() {
    const { theme } = this.props
    let statusBar = {
      backgroundColor: THEME_COLOR,
      barStyle: 'light-content'
    }
    let navigationBar = (
      <NavigationBar
        title={'最热'}
        statusBar={statusBar}
        style={{ backgroundColor: THEME_COLOR }}
      />
    )
    const TabNavigator = createAppContainer(
      createMaterialTopTabNavigator(this._getTabs(), {
        tabBarOptions: {
          tabStyle: styles.tabStyle,
          upperCaseLabel: false, //是否使标签大写，默认为true
          scrollEnabled: true, //是否支持 选项卡滚动，默认false
          style: {
            backgroundColor: '#678', //TabBar 的背景颜色
            height: 40 //fix 开启scrollEnabled后再Android上初次加载时闪烁问题
          },
          indicatorStyle: styles.indicatorStyle, //标签指示器的样式
          labelStyle: styles.labelStyle //文字的样式
        }
      })
    )
    return (
        <View style={[styles.container, {marginTop: DeviceInfo.isIPhoneX_deprecated ? 30 : 0}]}>
          {navigationBar}
          <TabNavigator />
        </View>
    )
  }
}

const mapPopularStateToProps = state => ({
  theme: state.theme.theme
})

export default connect(mapPopularStateToProps)(PopularPage)

const pageSize = 10;//设为常量，防止修改
class PopularTab extends Component {
  constructor(props) {
    super(props)
    console.log('子组件props----------', props);
    const { tabLabel } = this.props
    this.storeName = tabLabel
    this.loading = false
  }

  componentDidMount() {
    this.loadData()
  }

  loadData(loadMore) {
    const { onRefreshPopular, onLoadMorePopular } = this.props
    const store = this._store()
    const url = this.genFetchUrl(this.storeName) // 通过storeName 生成url
    if (loadMore) {
      onLoadMorePopular(
        this.storeName,
        ++store.pageIndex,
        pageSize,
        store.items,
        favoriteDao,
        callBack => {
          this.refs.toast.show('没有更多了')
        }
      )
    } else {
      onRefreshPopular(this.storeName, url, pageSize, favoriteDao)
    }
  }

  genFetchUrl(key) {
    return URL + key + QUERY_STR
  }

  renderItem(data) {
    const item = data.item
    return (
      <PopularItem
        projectModel={item}
        onSelect={(callback) => {
          NavigationUti.goPage(
            {
              projectModel: item,
              flag: FLAG_STORAGE.flag_popular,
              callback,
            },
            'DetailPage'
          )
        }}
        onFavorite={(item, isFavorite) =>
          FavoriteUtil.onFavorite(
            favoriteDao,
            item,
            isFavorite,
            FLAG_STORAGE.flag_popular
          )
        }
      />
    )
  }

  /**
   * 获取与当前页面有关的数据
   * @returns {*}
   * @private
   */
  _store() {
    const { popular } = this.props
    let store = popular[this.storeName]

    if (!store) {
      store = {
        items: [],
        isLoading: false,
        projectModels: [], //要显示的数据
        hideLoadingMore: true //默认隐藏加载更多
      }
    }
    return store
  }

  genIndicator() {
    return this._store().hideLoadingMore ? null : (
      <View style={styles.indicatorContainer}>
        <ActivityIndicator color="red" style={{ margin: 10 }} />
        <Text>正在加载更多</Text>
      </View>
    )
  }

  getEmpty() {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator color="red" style={{ margin: 10 }} />
        <Text>Loading</Text>
      </View>
    )
  }

  getLoadingHeader() {
    return this._store().isLoading ? (
      <View style={styles.indicatorContainer}>
        <ActivityIndicator color="red" style={{ margin: 10 }} />
        <Text>头部刷新</Text>
      </View>
    ) : null
  }

  render() {
    let store = this._store()
    if (store.isLoading) {
      return this.getEmpty()
    }
    return (
      <View style={styles.container}>
        <FlatList
          // 数据源
          data={store.projectModels}
          //item显示的布局
          renderItem={data => this.renderItem(data)}
          keyExtractor={item => '' + item.item.id}
          refreshing={store.isLoading}
          // onRefresh={() => this.loadData()}
          ListHeaderComponent={() => this.getLoadingHeader()}
          //下拉刷新相关
          refreshControl={
            <RefreshControl
              title={'Loading'}
              titleColor={THEME_COLOR}
              colors={[THEME_COLOR]}
              refreshing={store.isLoading}
              onRefresh={() => this.loadData()}
              tintColor={THEME_COLOR}
            />
          }
          ListFooterComponent={() => this.genIndicator()}
          onEndReached={() => {
            console.log('---onEndReached--')
             setTimeout(() => {
               if (this.canLoadMore) {
                 //fix 滚动时两次调用onEndReached https://github.com/facebook/react-native/issues/14015
                 this.loadData(true)
                 this.canLoadMore = false
               }
             }, 100)
          }}
          onEndReachedThreshold={0.5}
          onMomentumScrollBegin={() => {
            this.canLoadMore = true //fix 初始化时页调用onEndReached的问题
            console.log('---onMomentumScrollBegin-----')
          }}
        />
        <Toast ref={'toast'} position={'center'} />
      </View>
    )
  }
}
const mapStateToProps = state => ({
  popular: state.popular,
  theme: state.theme.theme
})

const mapDispatchToProps = dispatch => ({
  onRefreshPopular: (storeName, url, pageSize, favoriteDao) =>
    dispatch(actions.onRefreshPopular(storeName, url, pageSize, favoriteDao)),
  onLoadMorePopular: (storeName, pageIndex, pageSize, items, favoriteDao, callBack) =>
    dispatch(
      actions.onLoadMorePopular(storeName, pageIndex, pageSize, items,favoriteDao, callBack)
    )
})

//注意：connect只是个function，并不应定非要放在export后面
/**
 * 子组件订阅state,并设置常量 ，父组件可直接使用
 */
const PopularTabPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(PopularTab)

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  tabStyle: {
    // minWidth: 50 //fix minWidth会导致tabStyle初次加载时闪烁
    padding: 0
  },
  indicatorStyle: {
    height: 2,
    backgroundColor: 'white'
  },
  labelStyle: {
    fontSize: 15,
    margin: 0,
    lineHeight: 40
  },
  indicatorContainer: {
    alignItems: 'center'
  },
  indicator: {
    color: 'red',
    margin: 10
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  }
})
