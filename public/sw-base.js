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

workboxSW.precache([]);

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