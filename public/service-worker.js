importScripts('workbox-sw.prod.v2.1.3.js');
importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js');

const workboxSW = new self.WorkboxSW();

workboxSW.router.registerRoute(
  /.*(?:googleapis|gstatic)\.com.*$/, 
  workboxSW.strategies.staleWhileRevalidate({
    cacheName: 'google-fonts',
    cacheExpiration: {
      maxEntries: 3,
      maxAgeSeconds: 60 * 60 * 24 * 30
    }
  })
);

workboxSW.router.registerRoute(
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css', 
  workboxSW.strategies.staleWhileRevalidate({
    cacheName: 'material-css'
  })
);

workboxSW.router.registerRoute(
  /.*(?:firebasestorage\.googleapis)\.com.*$/, 
  workboxSW.strategies.staleWhileRevalidate({
    cacheName: 'post-images'
  })
);

workboxSW.router.registerRoute(
  'https://pwagram-f2499.firebaseio.com/posts.json', 
  function(args) {
    return fetch(args.event.request)
      .then(function(res) {
        let clonedRes = res.clone();
        clearAllData('posts')
          .then(function() {
            return clonedRes.json()
          })
          .then(function(data) {
            for (var key in data) {
              writeData('posts', data[key]);
            }
          });
        return res;
      })
  }
);

workboxSW.router.registerRoute(
  function(routeData) {
    return (routeData.event.request.headers.get('accept').includes('text/html'));
  }, 
  function(args) {
    return caches.match(args.event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        else {
          return fetch(args.event.request)
            .then(function(res) {
              return caches.open('dynamic')
                .then(function(cache) {
                  cache.put(args.event.request.url, res.clone())
                  return res;
                })
            })
            .catch(function(err) {
              return caches.match('/offline.html')
                .then(function(res) {
                  return res;
                });
            });
        }
      })
  }
);

workboxSW.precache([
  {
    "url": "favicon.ico",
    "revision": "2cab47d9e04d664d93c8d91aec59e812"
  },
  {
    "url": "index.html",
    "revision": "ffc698312a297b7b7fb3c24f5541202f"
  },
  {
    "url": "manifest.json",
    "revision": "61e7e0971f2a13efe89b96ba648c4a0f"
  },
  {
    "url": "offline.html",
    "revision": "84f2a71aeb25564f872dd3ed497a7539"
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
  },
  {
    "url": "src/js/app.min.js",
    "revision": "9cd8442974b1991e73a553376e0f48bc"
  },
  {
    "url": "src/js/feed.min.js",
    "revision": "bc8122ff93c1e23bbd947daa9286139e"
  },
  {
    "url": "src/js/fetch.min.js",
    "revision": "32590119a06bf9ade8026dd12baa695e"
  },
  {
    "url": "src/js/idb.min.js",
    "revision": "ea82c8cec7e6574ed535bee7878216e0"
  },
  {
    "url": "src/js/material.min.js",
    "revision": "713af0c6ce93dbbce2f00bf0a98d0541"
  },
  {
    "url": "src/js/promise.min.js",
    "revision": "7be19d2e97926f498f2668e055e26b22"
  },
  {
    "url": "src/js/utility.min.js",
    "revision": "87c407f438ff66627dc13dc10f4d4f6b"
  },
  {
    "url": "workbox-sw.prod.v2.1.3.js",
    "revision": "a9890beda9e5f17e4c68f42324217941"
  }
]);

self.addEventListener('sync', (e) => {
  console.log('[Service Worker] Background Syncing', e);
  if(e.tag === 'sync-new-posts') {
    console.log('[Service Worker] Syncing new posts');
    e.waitUntil(
      readAllData('sync-posts')
        .then(data => {
          const url = 'https://us-central1-pwagram-f2499.cloudfunctions.net/storePostData';
          for(let dt of data) {
            var postData = new FormData();
            postData.append('id', dt.id);
            postData.append('title', dt.title);
            postData.append('location', dt.location);
            postData.append('rawLocationLat', dt.rawLocation.lat);
            postData.append('rawLocationLng', dt.rawLocation.lng);
            postData.append('file', dt.picture, dt.id + '.png');

            fetch(url, {
              method: 'POST',
              body: postData
            })
            .then(res => {
              console.log('Sent data', res);
              if(res.ok) {
                res.json()
                  .then(resData => {
                    deleteItemFromData('sync-posts', resData.id);
                  })
              }
            })
            .catch(err => console.log('Error while sending data', err));
          }
        })
    )
  }
});

self.addEventListener('notificationclick', e => {
  const notification = e.notification;
  const action = e.action;

  console.log(notification);

  if(action === 'confirm') {
    console.log('Confirm was chosen');
    notification.close();
  }
  else {
    console.log(action);
    e.waitUntil(
      clients.matchAll()
        .then(_clients => {
          const client = _clients.find(c => {
            return c.visibility === 'visible';
          });

          if(client !== undefined) {
            client.navigate(notification.data.url);
            client.focus;
          }
          else {
            clients.openWindow(notification.data.url)
          }
          notification.close();
        })
    )
    notification.close();
  }
});

self.addEventListener('notificationclose', e => {
  console.log('Notification was closed', e);
});

self.addEventListener('push', e => {
  console.log('push notification received', e);

  let data = {title: 'New', content: 'Something new happened', openUrl: '/'};

  if(e.data) {
    data = JSON.parse(e.data.text());
  }

  const options = {
    body: data.content,
    icon: '/src/images/icons/app-icon-96x96.png',
    badge: '/src/images/icons/app-icon-96x96.png',
    data: {
      url: data.openUrl
    }
  }

  e.waitUntil(
    self.registration.showNotification(data.title, options)
  )
});