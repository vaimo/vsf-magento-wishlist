import { wishlistStore as extendWishlistVuex } from './store'
import whishListPersistPlugin from './store/whishListPersistPlugin'
import { extendStore } from '@vue-storefront/core/helpers';
import { StorefrontModule } from 'core/lib/modules';

export const MagentoWishlistExtend: StorefrontModule = function ({ store, router }) {
  extendStore('wishlist', extendWishlistVuex);
  store.subscribe(whishListPersistPlugin)
}
