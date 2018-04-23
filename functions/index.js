const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const webpush = require('web-push');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

var serviceAccount = require("./pwagram-fb-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://pwagram-f2499.firebaseio.com/'
});

exports.storePostData = functions.https.onRequest(function(request, response) {
 cors(request, response, function() {
   admin.database().ref('posts').push({
     id: request.body.id,
     title: request.body.title,
     location: request.body.location,
     image: request.body.image
   })
     .then(function() {
       webpush.setVapidDetails('mailto:business@marcian.guru', 'BFb-s1IckXJ9y9gjfNbLiX-bP4VG_A0-LwusyBiezvdV9bk_4Q9Fi5YKsZL3P09yvMEj_zdOOr7dYlrYRWHOsOc', 'RPmpTJE8wQSc3BNLvBGjC0TVbmfh3NLrV5s9J7Ar5t8');
       return admin.database().ref('subscriptions').once('value');
     })
     .then(subscriptions => {
       subscriptions.forEach(sub => {
        const pushConfig = {
          endpoint: sub.val().endpoint,
          keys: {
            auth: sub.val().keys.auth,
            p256dh: sub.val().keys.p256dh
          }
        };

        webpush.sendNotification(pushConfig, JSON.stringify({title: 'New Post', content: 'New Post added!'}))
          .catch(err => {
            console.log(err)
          });
       });
       response.status(201).json({message: 'Data stored', id: request.body.id});
     })
     .catch(function(err) {
       response.status(500).json({error: err});
     });
 });
});