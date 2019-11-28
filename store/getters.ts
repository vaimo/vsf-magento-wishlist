import { GetterTree } from 'vuex'
import RootState from '@vue-storefront/core/types/RootState'
import MagentoWishlistState from '../types/MagentoWishlistState'

const getters: GetterTree<MagentoWishlistState, RootState> = {
  getItemId: state => product => {
    return state.itemIds[product.sku]
  }
}

export default getters
