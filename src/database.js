'use strict'

const MongoClient = require('mongodb').MongoClient
const log = require('./log')
const { connection_string } = require('./settings')

let mongoClient

const OPTIONS = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}

const connect = () =>
    MongoClient.connect(connection_string, OPTIONS)
        .then(client => {
            mongoClient = client
            const database = client.db()
            log.info(`Connected to database ${database.databaseName} successfully.`)
            return database
        })
        .catch(err => {
            log.error('Unable to connect to database.')
            throw err
        })

const getDb = () => mongoClient.db()

const close = () => {
    if (mongoClient) {
        const database = mongoClient.db()
        log.info(`Closing database connection to ${database.databaseName}.`)
        mongoClient.close()
        mongoClient = null
    }
}

module.exports = { connect, getDb, close }
