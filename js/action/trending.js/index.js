
import Types from '../types'
import DataStore, { FLAG_STORAGE } from '../../expand/dao/DataStore'
import { handleData, _projectModels } from '../ActionUtil'

/**
 * 获取最热模块的异步action
 * @param {*} storeName
 * @param {*} url
 * @param {*} pageSize
 * @param {*} favoriteDao
 * @returns
 */
export function onRefreshTrending(storeName, url, pageSize, favoriteDao) {
  return async dispatch => {
    dispatch({ type: Types.TRENDING_REFRESH, storeName: storeName }) // 首先会触发刷新的action
    let dataStore = new DataStore()
    //异步action与数据流
    dataStore
      .fetchData(url, FLAG_STORAGE.flag_popular)
      .then(data => {
        handleData(
          Types.TRENDING_REFRESH_SUCCESS,
          dispatch,
          storeName,
          data,
          pageSize,
          favoriteDao
        )
      })
      .catch(error => {
        console.log(error)
        dispatch({
          type: Types.TRENDING_REFRESH_FAIL,
          storeName,
          error
        })
      })
  }
}
/**
 * 加载更多
 * @param storeName
 * @param pageIndex 第几页
 * @param pageSize 每页展示条数
 * @param dataArray 原始数据
 * @param callBack 回调函数，可以通过回调函数来向调用页面通信：比如异常信息的展示，没有更多等待
 * @param favoriteDao
 * @returns {function(*)}
 */
export function onLoadMoreTrending(
  storeName,
  pageIndex,
  pageSize,
  dataArray = [],
  favoriteDao,
  callBack
) {
  return dispatch => {
    setTimeout(() => {
      // 模拟网络请求
      if ((pageIndex - 1) * pageSize >= dataArray.length) {
        //已加载全部数据
        if (typeof callBack === 'function') {
          callBack('no more')
        }
        dispatch({
          type: Types.TRENDING_LOAD_MORE_FAIL,
          error: 'no more',
          storeName: storeName,
          pageIndex: --pageIndex
        })
      } else {
        // 本次可载入的最大数量
        let max =
          pageSize * pageIndex > dataArray.length
            ? dataArray.length
            : pageSize * pageIndex
        _projectModels(dataArray.slice(0, max), favoriteDao, data => {
          dispatch({
            type: Types.TRENDING_LOAD_MORE_SUCCESS,
            storeName,
            pageIndex,
            projectModels: data
          })
        })
      }
    }, 500)
  }
}
