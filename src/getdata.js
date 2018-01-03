'use strict'
const request = require('request')
const cheerio = require('cheerio')
const log = require('./log')

const home_url = 'http://www.leslibraires.fr/recherche?q='

const getdata = function(isbn, callback) {
    log.info('visiting ' + home_url + isbn, Date(Date.now()))
    let data = {error: 'not found'}
    request(home_url + isbn, function(error, resp, body) {
        if (error) {
            log.error('error getting ' + isbn, error)
            callback(data)
        } else {
            log.info('reading data from page')
            const $ = cheerio.load(body)
            let title
            let author
            let publisher
            if ($('.main-infos [itemprop=name]').length) {
                title = $('.main-infos [itemprop=name]').text().trim()
                author = $('.main-infos [itemprop=author]').eq(0).text().trim()
                publisher = $('.main-infos > h3 > a').text().trim()
                data = {title, author, publisher}
            }
            log.info('done. (' + title + ', ' + author + ')')
            callback(data)
        }
    })
}

module.exports = getdata
