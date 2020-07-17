import { ActionTree } from 'vuex'
import * as types from './mutation-types'
import RootState from '@vue-storefront/core/types/RootState'
import WishlistState from '../types/WishlistState'
import { htmlDecode } from '@vue-storefront/core/filters'
import { StorageManager } from '@vue-storefront/core/lib/storage-manager'
import * as coreTypes from '@vue-storefront/core/modules/wishlist/store/mutation-types';
import rootStore from '@vue-storefront/core/store'
import { processURLAddress } from '@vue-storefront/core/helpers';
import { adjustMultistoreApiUrl } from '@vue-storefront/core/lib/multistore';
import { TaskQueue } from '@vue-storefront/core/lib/sync';
import { Logger } from '@vue-storefront/core/lib/logger';
import { prepareQuery } from '@vue-storefront/core/modules/catalog/queries/common';
import i18n from '@vue-storefront/core/i18n'
import config from 'config'

const cacheStorage = StorageManager.get('wishlist')

const actions: ActionTree<WishlistState, RootState> = {
  clear (context): Promise<Response> {
    return new Promise((resolve, reject) => {
      const clear = () => {
        context.commit(coreTypes.WISH_LOAD_WISH, [])
        cacheStorage.removeItem('current-wishlist')
      }

      if (rootStore.state.user.current) {
        let url = processURLAddress(config.magentoWishlist.endpoint) + '?token={{token}}'
        url = config.storeViews.multistore ? adjustMultistoreApiUrl(url) : url
        TaskQueue.execute({ url,
          payload: {
            method: 'DELETE',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            mode: 'cors',
            body: JSON.stringify({
              items: context.state.items.map(item => item.id)
            })
          }
        }).then(resp => {
          if (resp.resultCode === 200 && resp.result === true) {
            clear()
            resolve(resp.result)
          } else {
            reject(resp)
          }
        }).catch(err => {
          reject(err)
        })
      } else {
        clear()
        resolve()
      }
    })
  },
  load ({ state, commit, getters }, force: boolean = false): Promise<Response> {
    if (getters.isWishlistLoading || (!force && getters.isWishlistLoaded)) return

    commit(types.SET_WISHLIST_LOADING)

    return new Promise((resolve, reject) => {
      if (rootStore.state.user.current) {
        let url = processURLAddress(config.magentoWishlist.endpoint) + '?token={{token}}'
        url = config.storeViews.multistore ? adjustMultistoreApiUrl(url) : url

        TaskQueue.execute({ url,
          payload: {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            },
            mode: 'cors'
          }
        }).then(resp => {
          if (resp.resultCode === 200) {
            commit(coreTypes.WISH_LOAD_WISH, resp.result.items.map(item => item.product))
            commit(types.SET_WISHLIST_ITEM_IDS, resp.result.items)
            commit(coreTypes.SET_WISHLIST_LOADED)
            Logger.info('Wishlist state loaded from magento. ', 'api', state.items)()
            cacheStorage.setItem('current-wishlist', state.items)

            if (resp.result.items_count > 0) {
              const productSKUs = state.items.map(item => item.sku)
              const skuQuery = prepareQuery({ filters: [
                { key: 'sku', value: { 'in': productSKUs } }
              ] })

              rootStore.dispatch('product/list', {
                query: skuQuery
              }).then(res => {
                if (res) {
                  commit(coreTypes.WISH_LOAD_WISH, res.items)
                  cacheStorage.setItem('current-wishlist', state.items)
                }
              })
            }

            resolve(resp.result)
          } else {
            reject(resp)
          }
        }).catch(err => {
          reject(err)
        }).finally(() => {
          commit(types.SET_WISHLIST_LOADING, false)
        })
      } else {
        cacheStorage.getItem('current-wishlist', (err, storedItems) => {
          if (err) {
            reject(err)
            throw new Error(err)
          }
          commit(coreTypes.WISH_LOAD_WISH, storedItems)
          commit(coreTypes.SET_WISHLIST_LOADED)
          commit(types.SET_WISHLIST_LOADING, false)
          Logger.info('Wishlist state loaded from browser cache. ', 'cache', storedItems)()
          resolve(storedItems)
        })
      }
    })
  },
  addItem ({ state, commit, dispatch }, product): Promise<Response> {
    return new Promise((resolve, reject) => {
      const addItem = product => {
        commit(coreTypes.WISH_ADD_ITEM, { product })
        cacheStorage.setItem('current-wishlist', state.items).catch((reason) => {
          Logger.error(reason, 'wishlist') // it doesn't work on SSR
        })
        if (rootStore.state.user.current) {
          dispatch('load', true)
        }
        resolve(product)
      }

      if (rootStore.state.user.current) {
        let url = processURLAddress(config.magentoWishlist.endpoint) + '/' + product.sku + '?token={{token}}'
        url = config.storeViews.multistore ? adjustMultistoreApiUrl(url) : url

        TaskQueue.execute({ url,
          payload: {
            method: 'PUT',
            headers: {
              'Accept': 'application/json'
            },
            mode: 'cors'
          }
        }).then(resp => {
          if (resp.resultCode === 200 && resp.result === true) {
            addItem(product)
          } else {
            reject(resp)
          }
        }).catch(err => {
          reject(err)
        })
      } else {
        addItem(product)
      }
    })
  },
  removeItem ({ state, getters, commit }, product): Promise<Response> {
    return new Promise((resolve, reject) => {
      const removeItem = product => {
        commit(coreTypes.WISH_DEL_ITEM, { product })
        cacheStorage.setItem('current-wishlist', state.items).catch((reason) => {
          Logger.error(reason, 'wishlist') // it doesn't work on SSR
        })
        resolve(product)
      }

      if (rootStore.state.user.current) {
        let wishItemId = getters.getItemId(product)

        if (typeof wishItemId === 'undefined') {
          removeItem(product)
          return
        }

        let url = processURLAddress(config.magentoWishlist.endpoint) + '/' + wishItemId + '?token={{token}}'
        url = config.storeViews.multistore ? adjustMultistoreApiUrl(url) : url

        TaskQueue.execute({ url,
          payload: {
            method: 'DELETE',
            headers: {
              'Accept': 'application/json'
            },
            mode: 'cors'
          }
        }).then(resp => {
          if (resp.resultCode === 200 && resp.result === true) {
            commit(types.WISHLIST_DEL_ITEM_ID, { product })
            removeItem(product)
          } else {
            reject(resp)
          }
        }).catch(err => {
          reject(err)
        })
      } else {
        removeItem(product)
      }
    })
  },
  loadFromCache () {
    const wishlistStorage = StorageManager.get('wishlist')
    return wishlistStorage.getItem('current-wishlist')
  }
}

export default actions
