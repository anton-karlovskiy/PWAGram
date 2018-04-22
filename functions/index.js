// const functions = require('firebase-functions');
// const admin = require('firebase-admin');
// const cors = require('cors')({origin: true});
// // const cors = require('cors')();
// // // Create and Deploy Your First Cloud Functions
// // // https://firebase.google.com/docs/functions/write-firebase-functions
// //
// // exports.helloWorld = functions.https.onRequest((request, response) => {
// //  response.send("Hello from Firebase!");
// // });

// exports.storePostData = functions.https.onRequest((request, response) => {
//   cors((request, response, () => {
//     admin.database().ref('posts').push({
//       id: request.body.id,
//       title: req.body.title,
//       location: req.body.location,
//       image: request.body.image
//     })
//     .then(() => {
//       response.status(201).json({message: 'Data stored', id: request.body.id});
//     })
//     .catch(err => {
//       response.status(500).json({error: err})
//     })
//   })
// });

// 
var functions = require('firebase-functions');
var admin = require('firebase-admin');
var cors = require('cors')({origin: true});

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
       response.status(201).json({message: 'Data stored', id: request.body.id});
     })
     .catch(function(err) {
       response.status(500).json({error: err});
     });
 });
});