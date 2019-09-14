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
import TrendingItem from '../common/TrendingItem'
import FavoriteUtil from '../util/FavoriteUtil'
import EventBus from 'react-native-event-bus'
import EventTypes from '../util/EventTypes'

const URL = 'https://api.github.com/search/repositories?q='
const QUERY_STR = '&sort=stars'
const THEME_COLOR = '#678'
const favoriteDao = new FavoriteDao(FLAG_STORAGE.flag_popular)
class FavoritePage extends Component {
    constructor(props) {
        super(props)
        this.tabNames = ['最热', '趋势']
    }

    render() {
        const { theme } = this.props
        let statusBar = {
            backgroundColor: THEME_COLOR,
            barStyle: 'light-content'
        }
        let navigationBar = (
            <NavigationBar
                title={'收藏'}
                statusBar={statusBar}
                style={{ backgroundColor: THEME_COLOR }}
            />
        )
        const TabNavigator = createAppContainer(
            createMaterialTopTabNavigator(
                {
                    Popular: {
                        screen: props => (
                            <FavoriteTabPage
                                {...props}
                                flag={FLAG_STORAGE.flag_popular}
                                theme={theme}
                            />
                        ), //初始化Component时携带默认参数 @https://github.com/react-navigation/react-navigation/issues/2392
                        navigationOptions: {
                            title: '最热'
                        }
                    },
                    Trending: {
                        screen: props => (
                            <FavoriteTabPage
                                {...props}
                                flag={FLAG_STORAGE.flag_trending}
                                theme={theme}
                            />
                        ), //初始化Component时携带默认参数 @https://github.com/react-navigation/react-navigation/issues/2392
                        navigationOptions: {
                            title: '趋势'
                        }
                    }
                },
                {
                    tabBarOptions: {
                        tabStyle: styles.tabStyle,
                        upperCaseLabel: false, //是否使标签大写，默认为true
                        style: {
                            backgroundColor: '#678', //TabBar 的背景颜色
                            height: 40 //fix 开启scrollEnabled后再Android上初次加载时闪烁问题
                        },
                        indicatorStyle: styles.indicatorStyle, //标签指示器的样式
                        labelStyle: styles.labelStyle //文字的样式
                    }
                }
            )
        )
        return (
            <View
                style={[
                    styles.container,
                    { marginTop: DeviceInfo.isIPhoneX_deprecated ? 30 : 0 }
                ]}
            >
                {navigationBar}
                <TabNavigator />
            </View>
        )
    }
}

const mapPopularStateToProps = state => ({
    theme: state.theme.theme
})

export default connect(mapPopularStateToProps)(FavoritePage)

const pageSize = 10 //设为常量，防止修改
class FavoriteTab extends Component {
    constructor(props) {
        super(props)
        const { flag } = this.props
        this.storeName = flag
        this.favoriteDao = new FavoriteDao(flag)
    }

    componentDidMount() {
        this.loadData(true)
        EventBus.getInstance().addListener(EventTypes.bottom_tab_select, this.listenter = data => {
            if (data.to === 2) {
                this.loadData(false)
            }
        })
    }

    componentWillUnmount() {
        EventBus.getInstance().removeListener(this.listenter)
    }
    

    loadData(isShowLoading) {
        const { onLoadFavoriteData } = this.props
        onLoadFavoriteData(this.storeName, isShowLoading)
    }

    genFetchUrl(key) {
        return URL + key + QUERY_STR
    }

    onFavorite(item, isFavorite) {
        FavoriteUtil.onFavorite(this.favoriteDao, item, isFavorite, this.props.flag);
        if (this.storeName === FLAG_STORAGE.flag_popular) {
            EventBus.getInstance().fireEvent(EventTypes.favorite_changed_popular);
        } else {
            EventBus.getInstance().fireEvent(EventTypes.favoriteChanged_trending);
        }
    }

    renderItem(data) {
        const { theme } = this.props
        const item = data.item
        const Item =
            this.storeName === FLAG_STORAGE.flag_popular
                ? PopularItem
                : TrendingItem
        return (
            <Item
                theme={theme}
                projectModel={item}
                onSelect={callback => {
                    NavigationUtil.goPage(
                        {
                            theme,
                            projectModel: item,
                            flag: this.storeName,
                            callback
                        },
                        'DetailPage'
                    )
                }}
                onFavorite={(item, isFavorite) => this.onFavorite(item, isFavorite)}
            />
        )
    }

    /**
     * 获取与当前页面有关的数据
     * @returns {*}
     * @private
     */
    _store() {
        const { favorite } = this.props
        let store = favorite[this.storeName]
        if (!store) {
            store = {
                items: [],
                isLoading: false,
                projectModels: [] //要显示的数据
            }
        }
        return store
    }

    render() {
        let store = this._store()
        return (
            <View style={styles.container}>
                <FlatList
                    // 数据源
                    data={store.projectModels}
                    //item显示的布局
                    renderItem={data => this.renderItem(data)}
                    keyExtractor={item =>
                        '' + item.item.id || item.item.fullName
                    }
                    //下拉刷新相关
                    refreshControl={
                        <RefreshControl
                            title={'Loading'}
                            titleColor={THEME_COLOR}
                            colors={[THEME_COLOR]}
                            refreshing={store.isLoading}
                            onRefresh={() => this.loadData(true)}
                            tintColor={THEME_COLOR}
                        />
                    }
                />
                <Toast ref={'toast'} position={'center'} />
            </View>
        )
    }
}
const mapStateToProps = state => ({
    favorite: state.favorite
})

const mapDispatchToProps = dispatch => ({
    //将 dispatch(onRefreshPopular(storeName, url))绑定到props
    onLoadFavoriteData: (storeName, isShowLoading) =>
        dispatch(actions.onLoadFavoriteData(storeName, isShowLoading))
})
//注意：connect只是个function，并不应定非要放在export后面
/**
 * 子组件订阅state,并设置常量 ，父组件可直接使用
 */

//注意：connect只是个function，并不应定非要放在export后面
const FavoriteTabPage = connect(
    mapStateToProps,
    mapDispatchToProps
)(FavoriteTab)

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
