'use strict'

const database = require('./database')
const log = require('./log')

const reduce = function(item,res) {
    res.total += item.price * 100
    res.count += item.quantity
}

const getCart = username =>
    database
        .getDb()
        .collection('cart')
        .group([], { username }, { total: 0, count: 0 }, reduce, true)
        .then(results => {
            const cart = results[0] || {total:0}
            cart.total = (cart.total / 100).toFixed(2)
            return cart
        })
        .catch(err => {
            log.error('getCart', err)
            return {}
        })

module.exports = getCart
