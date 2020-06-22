import { ActionTree } from 'vuex'
import config from 'config'
import i18n from '@vue-storefront/i18n'
import { TaskQueue } from '@vue-storefront/core/lib/sync'
import { htmlDecode } from '@vue-storefront/core/filters'
import * as coreTypes from '@vue-storefront/core/modules/wishlist/store/mutation-types'
import * as types from './mutation-types'
import { processURLAddress } from '@vue-storefront/core/helpers'
import { adjustMultistoreApiUrl } from '@vue-storefront/core/lib/multistore'
import RootState from '@vue-storefront/core/types/RootState'
import MagentoWishlistState from '../types/MagentoWishlistState'
import { StorageManager } from '@vue-storefront/core/lib/storage-manager'
import { Logger } from '@vue-storefront/core/lib/logger'
import rootStore from '@vue-storefront/core/store'
import { prepareQuery } from '@vue-storefront/core/modules/catalog/queries/common'

const cacheStorage = StorageManager.get('wishlist')

const actions: ActionTree<MagentoWishlistState, RootState> = {
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
    if (!force && getters.isWishlistLoaded) return

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
            commit(coreTypes.SET_WISHLIST_LOADED)
            commit(coreTypes.WISH_LOAD_WISH, resp.result.items.map(item => item.product))
            commit(types.SET_WISHLIST_ITEM_IDS, resp.result.items)
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
        })
      } else {
        cacheStorage.getItem('current-wishlist', (err, storedItems) => {
          if (err) {
            reject(err)
            throw new Error(err)
          }
          commit(coreTypes.SET_WISHLIST_LOADED)
          commit(coreTypes.WISH_LOAD_WISH, storedItems)
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
        rootStore.dispatch('notification/spawnNotification', {
          type: 'success',
          message: i18n.t('Product {productName} has been added to wishlist!', { productName: htmlDecode(product.name) }),
          action1: { label: i18n.t('OK') }
        })
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
        rootStore.dispatch('notification/spawnNotification', {
          type: 'success',
          message: i18n.t('Product {productName} has been removed from wishlit!', { productName: htmlDecode(product.name) }),
          action1: { label: i18n.t('OK') }
        })
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
  }
}

export default actions
