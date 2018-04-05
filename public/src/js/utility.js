
var dbPromise = idb.open('posts-store', 1, db => {
  if(!db.objectStoreNames.contains('posts')) {
    db.createObjectStore('posts', {keyPath: 'id'});
  }

  if(!db.objectStoreNames.contains('sync-posts')) {
    db.createObjectStore('sync-posts', {keyPath: 'id'});
  }
});

function writeData(st, data) {
  return dbPromise
    .then(db => {
      console.log('[writeData] data', data);
  
      var tx = db.transaction(st, 'readwrite');
      var store = tx.objectStore(st);
      store.put(data);
      return tx.complete;
    })
    .catch(err => console.log('Error', err));
}

function readAllData(st) {
  console.log('[readAllData] st', st);
  return dbPromise
    .then(db => {
      //debugger;
      var tx = db.transaction(st, 'readonly');
      var store = tx.objectStore(st);
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