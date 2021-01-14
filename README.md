# Vue Storefront Magento Wishlist Extension

Magento Wishlist module for [vue-storefront](https://github.com/DivanteLtd/vue-storefront).
Requires mediamanDE [magento-module-wishlist-api](https://github.com/mediamanDE/magento-module-wishlist-api)

## Installation

By hand (preferer):

```shell
git clone --single-branch --branch feature/tkg-selver git@github.com:vaimo/vsf-magento-wishlist.git ./vue-storefront/src/modules/

// or add as submodule
$ git submodule add -b feature/tkg-selver git@github.com:vaimo/vsf-magento-wishlist.git src/modules/vsf-magento-wishlist
$ git submodule update --remote
```

Registration the Magento Wishlist module. Go to `./vue-storefront/src/modules/index.ts`

```js
...
import { MagentoWishlistExtend } from './vsf-magento-wishlist';

registerModule(MagentoWishlistExtend)
```

Add following settings to your config file.

```json
  "magentoWishlist": {
    "endpoint": "/api/ext/magento-wishlist?token={{token}}",
    "add_endpoint": "/api/ext/magento-wishlist/{{sku}}?token={{token}}",
    "remove_endpoint": "/api/ext/magento-wishlist/{{itemId}}?token={{token}}"
  },
```

## Magento Wishlist API extension

Install additional extension for `vue-storefront-api`:

```shell
cp -f ./vue-storefront/src/modules/vsf-magento-wishlist/API/magento-wishlist ./vue-storefront-api/src/api/extensions/
```

Add it to `registeredExtensions` in your api config.

```json
  "registeredExtensions": [
    ...
    "magento-wishlist"
  ],
```
