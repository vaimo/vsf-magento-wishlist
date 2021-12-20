import { wishlistStore as extendWishlistVuex } from './store'
import whishListPersistPlugin from './store/whishListPersistPlugin'
import { extendStore, isServer } from '@vue-storefront/core/helpers';
import { StorefrontModule } from 'core/lib/modules';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus'

export const MagentoWishlistExtend: StorefrontModule = function ({ store, router }) {
  extendStore('wishlist', extendWishlistVuex);
  store.subscribe(whishListPersistPlugin)

  if (!isServer) {
    EventBus.$on('user-after-loggedin', () => {
      store.dispatch('wishlist/load', true)
    })

    EventBus.$on('user-after-logout', () => {
      store.dispatch('wishlist/reset')
    })
  }
}
