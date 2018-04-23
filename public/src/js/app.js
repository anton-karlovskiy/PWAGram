let deferredPrompt;
const enableNotificationsButtons = document.querySelectorAll('.enable-notifications');

// Activate Promise polyfill if Promise not supported browser
if(!window.Promise) {
  window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(function() {
      console.log('Service worker registered');
    })
    .catch(function(error) {
      console.log(error);
    });
}

window.addEventListener('beforeinstallprompt', function(event) {
  console.log('beforeinstallprompt fired');
  event.preventDefault();
  deferredPrompt = event;
  return false;
});

const displayConfirmNotification = () => {
  if('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(swreg => { // swreg -> Service Worker Registration
        const options = {
          body: 'You successfully subscribed to our notification service.',
          icon: '/src/images/icons/app-icon-96x96.png',
          image: '/src/images/sf-boat.jpg',
          dir: 'ltr',
          lang: 'en-US', // BCP 47
          vibrate: [100, 50, 200], // On 100ms, pause 50ms, on 200ms
          badge: '/src/images/icons/app-icon-96x96.png',
          tag: 'confirm-notification', // tag used for showing only one notification of a tag
          renotify: false, // New notifications of same tag wont renotify
          actions: [
            { action: 'confirm', title:'Okay', icon: '/src/images/icons/app-icon-96x96.png'},
            { action: 'cancel', title:'Cancel', icon: '/src/images/icons/app-icon-96x96.png'}
          ]
        }
        swreg.showNotification('Successfully subscribed!', options)
      });
  }
}

configurePushSub = () => {
  if(!('serviceWorker' in navigatore)) {
    return;
  }

  const swreg;
  navigator.serviceWorker.ready
    .then(_swreg => { // Service Worker Registration
      swreg = _swreg;
      return swreg.pushManager.getSubscription();
    })
    .then(sub => {
      if(sub === null) {
        // Create new subscription
        reg.pushMangager.subscribe({
          userVisibleOnly: true
        });
      }
      else {
        // We have a subscription
      }
    });
}

const askForNotificationPermission = () => {
  Notification.requestPermission(result => {
    console.log('User Choice', result);
    if(result !== 'granted') {
      console.log('No notification permission granted!');
    }
    else {
      // displayConfirmNotification();
      configurePushSub();
    }
  })
};

if ('Notification' in window) {
  enableNotificationsButtons.forEach(btn => {
    btn.style.display = 'inline-block';
    btn.onclick = askForNotificationPermission;
  });
}