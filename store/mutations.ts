import { MutationTree } from 'vuex'
import * as types from './mutation-types'
import MagentoWishlistState from '../types/MagentoWishlistState'

const mutations: MutationTree<MagentoWishlistState> = {
  [types.SET_WISHLIST_ITEM_IDS] (state, items) {
    state.itemIds = {}
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      state.itemIds[item.product.sku] = item.id
    }
  },
  [types.WISHLIST_DEL_ITEM_ID] (state, { product }) {
    delete state.itemIds[product.sku]
  }
}

export default mutations
