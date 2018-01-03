const MONGOLAB_URL = 'mongodb://127.0.0.1:27017/testDb';
process.env.MONGOLAB_URL = MONGOLAB_URL;

const childProcess = require('child_process');
const database = require('../src/database');

database
    .connect()
    .then(db => db.collections())
    .then(collections => {
        // Properly clean database, because dropDatabase() has issues with index constraints
        const db = database.getDb();
        return Promise.all(collections.map(c => db.collection(c.collectionName).deleteMany()));
    })
    .then(() =>
        database
            .getDb()
            .collection('users')
            .insertOne({ name: 'admin', password: 'admin', role: 'admin' })
    )
    .then(database.close)
    .then(() => {
        childProcess.fork('src/server.js', {
            env: { MONGOLAB_URL, PORT: 7777, silent: true }
        });
    })
    .catch(error => console.error('Unable to start test server', error));
