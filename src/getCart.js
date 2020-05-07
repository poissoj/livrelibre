'use strict';

const database = require('./database');
const log = require('./log');

const getCart = (username) =>
    database
        .getDb()
        .collection('cart')
        .aggregate([
            { $match: { username } },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: {
                            $multiply: [
                                {
                                    $convert: {
                                        input: '$price',
                                        to: 'double',
                                    },
                                },
                                '$quantity',
                                100,
                            ],
                        },
                    },
                    count: {
                        $sum: '$quantity'
                    }
                },
            },
        ])
        .toArray()
        .then(results => {
            const cart = results[0] || { total: 0 };
            cart.total = (cart.total / 100).toFixed(2);
            return cart;
        })
        .catch((err) => {
            log.error('getCart', err);
            return {};
        });

module.exports = getCart;
