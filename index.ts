import { VueStorefrontModuleConfig } from '@vue-storefront/core/lib/module'
import { module } from './store'

export const KEY = 'wishlist'

export const MagentoWishlistExtend: VueStorefrontModuleConfig = {
  key: KEY,
  store: { modules: [{ key: KEY, module }] }
}
