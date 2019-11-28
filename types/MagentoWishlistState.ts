import WishlistState from '@vue-storefront/core/modules/wishlist/types/WishlistState'

interface WishlistItemId {
  [key: string]: number
}

export default interface MagentoWishlistState extends WishlistState {
  itemIds: WishlistItemId
}
