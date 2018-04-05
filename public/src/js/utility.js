
var dbPromise = idb.open('posts-store', 1, db => {
  if(!db.objectStoreNames.contains('posts')) {
    db.createObjectStore('posts', {keyPath: 'id'});
  }
});

function writeData(store, data) {
  return dbPromise
    .then(db => {
      console.log('[writeData] data', data);
  
      var store = 'posts';
      var tx = db.transaction(store, 'readwrite');
      var store = tx.objectStore(store);
      store.put(key, data);
      return tx.complete;
    })
    .catch(err => console.log('Error', err));
}

function readAllData(store) {
  console.log('[readAllData] store', store);
  return dbPromise
    .then(db => {
      //debugger;
      var store = 'posts'
      var tx = db.transaction(store, 'readonly');
      var store = tx.objectStore(store);
      return store.getAll();
    });
}

function clearAllData(st) {
  return dbPromise
    .then(db => {
      var tx = db.transaction(st, 'readwrite');
      var store = tx.objectStore(st);
      store.clear();
      return tx.complete;
    });
}

function deleteItemFromData(st, id) {
  return dbPromise
    .then(db => {
      var tx = db.transaction(st, 'readwrite');
      var store = tx.objectStore(st);
      store.delete(id);
      return tx.complete;
    })
    .then(() => {
      console.log('item deleted');
    });
}
// dbPromise.then(db => {
//   return db.transaction('objs')
//     .objectStore('objs').getAll();
// }).then(allObjs => console.log(allObjs));