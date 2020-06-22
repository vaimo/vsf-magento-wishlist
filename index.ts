import { module } from './store'
import { StorefrontModule } from '@vue-storefront/core/lib/modules'

export const KEY = 'wishlist'

export const MagentoWishlistExtend: StorefrontModule = function ({ store, router, appConfig }) {
  store.registerModule(KEY, module)
}
