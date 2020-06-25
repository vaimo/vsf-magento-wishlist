interface WishlistItemId {
  [key: string]: number
}

export default interface WishlistState {
  /**
   * Informs if wishlist is already loaded from local cache.
   */
  loaded: boolean,
  items: any[],
  itemIds: WishlistItemId
}
