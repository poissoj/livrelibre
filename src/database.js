'use strict'

const MongoClient = require('mongodb').MongoClient
const log = require('./log')

const connection_string = process.env.MONGOLAB_URL || 'mongodb://127.0.0.1:27017/tsavant'

let database

const connect = () =>
    MongoClient.connect(connection_string)
        .then(db => {
            log.info(`Connected to database ${db.databaseName} successfully.`)
            database = db
            return db
        })
        .catch(err => {
            log.error('Unable to connect to database.')
            throw err
        })

const getDb = () => database

const close = () => {
    if (database) {
        log.info(`Closing database connection to ${database.databaseName}.`)
        database.close()
        database = null
    }
}

module.exports = { connect, getDb, close }
