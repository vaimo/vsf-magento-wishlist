# Vue Storefront Magento Wishlist Extension

Magento Wishlist module for [vue-storefront](https://github.com/DivanteLtd/vue-storefront).
Requires mediamanDE [magento-module-wishlist-api](https://github.com/mediamanDE/magento-module-wishlist-api)

## Installation

By hand (preferer):

```shell
git clone git@github.com:AbsoluteWebServices/vsf-magento-wishlist.git ./vue-storefront/src/modules/
```

Registration the Magento Wishlist module. Go to `./vue-storefront/src/modules/index.ts`

```js
...
import { MagentoWishlistExtend } from './vsf-magento-wishlist'

extendModule(MagentoWishlistExtend)
```

Add following settings to your config file.

```json
  "magentoWishlist": {
    "endpoint": "http://localhost:8080/api/ext/magento-wishlist"
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
