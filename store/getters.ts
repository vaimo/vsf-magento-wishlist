import { GetterTree } from 'vuex'
import RootState from '@vue-storefront/core/types/RootState'
import WishlistState from '../types/WishlistState'

const getters: GetterTree<WishlistState, RootState> = {
  isOnWishlist: state => product =>
    state.items.some(p => p.sku === product.sku),
  isWishlistLoaded: state => state.loaded,
  isWishlistLoading: state => state.loading,
  getWishlistItemsCount: state => state.items.length,
  getItemId: state => product => {
    return state.itemIds[product.sku]
  }
}

export default getters
