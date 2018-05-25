importScripts('workbox-sw.prod.v2.1.3.js');

/**
 * DO NOT EDIT THE FILE MANIFEST ENTRY
 *
 * The method precache() does the following:
 * 1. Cache URLs in the manifest to a local cache.
 * 2. When a network request is made for any of these URLs the response
 *    will ALWAYS comes from the cache, NEVER the network.
 * 3. When the service worker changes ONLY assets with a revision change are
 *    updated, old cache entries are left as is.
 *
 * By changing the file manifest manually, your users may end up not receiving
 * new versions of files because the revision hasn't changed.
 *
 * Please use workbox-build or some other tool / approach to generate the file
 * manifest which accounts for changes to local files and update the revision
 * accordingly.
 */
const fileManifest = [
  {
    "url": "404.html",
    "revision": "0a27a4163254fc8fce870c8cc3a3f94f"
  },
  {
    "url": "favicon.ico",
    "revision": "2cab47d9e04d664d93c8d91aec59e812"
  },
  {
    "url": "index.html",
    "revision": "c972f041e5dbab4272f8eaf5ceeca5da"
  },
  {
    "url": "manifest.json",
    "revision": "61e7e0971f2a13efe89b96ba648c4a0f"
  },
  {
    "url": "offline.html",
    "revision": "693c8bae694762e0ff7fbe08da942408"
  },
  {
    "url": "src/css/app.css",
    "revision": "f27b4d5a6a99f7b6ed6d06f6583b73fa"
  },
  {
    "url": "src/css/feed.css",
    "revision": "6ccf1aabe84e943b9bc406e4343ffee2"
  },
  {
    "url": "src/css/help.css",
    "revision": "1c6d81b27c9d423bece9869b07a7bd73"
  },
  {
    "url": "src/js/app.js",
    "revision": "93c553b3ff58d984fa9ef0477c151780"
  },
  {
    "url": "src/js/feed.js",
    "revision": "e6b7259ed7c35b17e7052a003bb92764"
  },
  {
    "url": "src/js/fetch.js",
    "revision": "872486c28886e492196e3dca936bec01"
  },
  {
    "url": "src/js/idb.js",
    "revision": "6c76ebc82c2d7220fd7fbe2fa8d2b53a"
  },
  {
    "url": "src/js/material.min.js",
    "revision": "713af0c6ce93dbbce2f00bf0a98d0541"
  },
  {
    "url": "src/js/promise.js",
    "revision": "10c2238dcd105eb23f703ee53067417f"
  },
  {
    "url": "src/js/utility.js",
    "revision": "7331d41fa04a4a78e78b280c3987e16c"
  },
  {
    "url": "sw.js",
    "revision": "9a3cbbe0d483cce6ec35c2001a592686"
  },
  {
    "url": "src/images/main-image-lg.jpg",
    "revision": "31b19bffae4ea13ca0f2178ddb639403"
  },
  {
    "url": "src/images/main-image-sm.jpg",
    "revision": "c6bb733c2f39c60e3c139f814d2d14bb"
  },
  {
    "url": "src/images/main-image.jpg",
    "revision": "5c66d091b0dc200e8e89e56c589821fb"
  },
  {
    "url": "src/images/sf-boat.jpg",
    "revision": "0f282d64b0fb306daf12050e812d6a19"
  }
];

const workboxSW = new self.WorkboxSW();
workboxSW.precache(fileManifest);
