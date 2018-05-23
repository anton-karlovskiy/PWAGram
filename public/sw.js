importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js');

var CACHE_STATIC_NAME = 'static-v14';
var CACHE_DYNAMIC_NAME = 'dynamic-v2';
var STATIC_FILES = [
  '/',
  'index.html',
  '/offline.html',
  '/src/js/app.js',
  '/src/js/feed.js',
  '/src/js/idb.js',
  '/src/js/utility.js',
  '/src/js/promise.js',
  '/src/js/fetch.js',
  '/src/js/material.min.js',
  '/src/css/app.css',
  '/src/css/feed.css',
  '/src/images/main-image.jpg',
  'https://fonts.googleapis.com/css?family=Roboto:400,700',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
];

var dbPromise = idb.open('posts-store', 1, db => {
  if(!db.objectStoreNames.contains('posts')) {
    db.createObjectStore('posts', {keyPath: 'id'});
  }
});

// function trimCache(cacheName, maxItems) {
//   caches.open(cacheName)
//     .then(cache => {
//       cache.keys()
//         .then(keys => {
//           if (keys.length > maxItems) {
//             cache.delete(keys[0])
//               .then(trimCache(cacheName, maxItems));
//           }
//         });
//     });
// }

self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing Service Worker ...', event);
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(function(cache) {
        console.log('[Service Worker] Precaching App Shell')
        cache.addAll(STATIC_FILES);
      })
  );
});

self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Activating Service Worker ...', event);
  event.waitUntil(
    caches.keys()
      .then(function(keyList) {
        return Promise.all(keyList.map(function(key) {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        }));
      })
  );
  return self.clients.claim();
});

// Cache with network fallback
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request)
//       .then(function(response) {
//         if (response) {
//           return response
//         }
//         else {
//           return fetch(event.request)
//             .then(function(res) {
//               return caches.open(CACHE_DYNAMIC_NAME)
//                 .then(function(cache) {
//                   cache.put(event.request.url, res.clone())
//                   return res;
//                 })
//             })
//             .catch(function(err) {
//               return caches.open(CACHE_STATIC_NAME)
//                 .then(function(cache) {
//                   return cache.match('/offline.html');
//                 });
//             });
//         }
//       })
//   );
// });

function isInArray(string, array) {
  var cachePath;
  if (string.indexOf(self.origin) === 0) { // request targets domain where we serve the page from (i.e. NOT a CDN)
    console.log('matched ', string);
    cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
  } else {
    cachePath = string; // store the full request (for CDNs)
  }
  return array.indexOf(cachePath) > -1;
}

// Alternative cache with network fallback
self.addEventListener('fetch', function(event) {
  var url = 'https://pwagram-f2499.firebaseio.com/posts';
  if(event.request.url.indexOf(url) > -1) {
    // Cache then network
    event.respondWith(
      fetch(event.request)
        .then(res => {
          let clonedRes = res.clone();
          clonedRes.json()
            .then(data => {
              for(let key in data) {
                dbPromise
                  .then(db => {
                    let tx = db.transaction('posts', 'readwrite');
                    let store = tx.objectStore('posts');
                    store.put(data[key]);
                    return tx.complete;
                  });
              }
            });
          return res;
        })
    );
  }
  // Cache only
  else if(isInArray(event.request.url, STATIC_FILES)) {
    try {
      event.respondWith(
        caches.match(event.request.url)
      );
    }
    catch(error) {
      console.log('caught');
    }
    
  }
  else {
    // Cache with network fallback
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {
          if (response) {
            return response
          }
          else {
            return fetch(event.request)
              .then(function(res) {
                return caches.open(CACHE_DYNAMIC_NAME)
                  .then(function(cache) {
                    cache.put(event.request.url, res.clone())
                    return res;
                  })
              })
              .catch(function(err) {
                return caches.open(CACHE_STATIC_NAME)
                  .then(function(cache) {
                    if (event.request.headers.get('accept').includes('text/html')) {
                      return cache.match('/offline.html');
                    } 
                  });
              });
          }
        })
    )
  }
});

// Cache only
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request)
//   );
// });

// Network only
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     fetch(event.request)
//   );
// });

// Network with Cache fallback
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     fetch(event.request)
//       .then(function(res){
//         return caches.open(CACHE_DYNAMIC_NAME)
//                 .then(function(cache) {
//                   cache.put(event.request.url, res.clone())
//                   return res;
//                 })
//       })
//       .catch(function(err) {
//         return caches.match(event.request)
//       })
//   );
// });

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