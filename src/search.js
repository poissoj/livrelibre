'use strict'

const log = require('./log')
const norm = require('./normalize')
const renderItemListPage = require('./pagination')

const normalizedFields = ['author', 'title']
const ignoreCaseFields = ['nmAuthor', 'nmTitle', 'keywords', 'comments']

const doSearch = (generateCriteria, cardTitle) => (req, res, next) => {
    if (!req.query) {
        res.redirect('/')
        return
    }
    const { criteria, searchCriteria } = generateCriteria(req.query)
    const pageNumber = Number(req.query.page || 1)

    renderItemListPage({
        query: criteria,
        sortParams: { title: 1 },
        cardTitle,
        pageTitle: req.app.locals.appName + ' - ' + cardTitle,
        rootURL: req.originalUrl.replace(/&page=\d+$/, '') + '&',
        subtitle: count => `${count || 'Aucun'} résultat${count > 1 ? 's' : ''} pour ${searchCriteria}`
    })(pageNumber, res, next)

}

function addRegexp(object) {
    for (const key in object) {
        if (object[key] === '') {
            delete object[key]
        } else if (ignoreCaseFields.indexOf(key) !== -1) {
            object[key] = new RegExp(object[key], 'i')
        }
    }
}

function normalizeFields(object) {
    normalizedFields.forEach(field => {
        if (object[field]) {
            object['nm' + field[0].toUpperCase() + field.slice(1)] = norm(object[field])
            delete object[field]
        }
    })
}

function generateSearchCriteria(query) {
    const body = Object.assign({}, query)
    delete body.page
    normalizeFields(body)
    addRegexp(body)
    let criteria = Object.keys(body).reduce(function(list, key) {
        const o = {}
        if (/\s/.test(body[key].source)) {
            list.push(
                ...body[key].source
                .split(/\s+/)
                .map(str => ({ [key]: new RegExp(str.replace(/\?/g, '\\?'), 'i') }))
            )
        } else {
            o[key] = body[key]
            if (key === 'amount') {
                o.amount = +o.amount
            }
            list.push(o)
        }
        return list
    }, [])
    log.info('Search', criteria)
    if (criteria.length === 0) {
        criteria = [{}]
    }
    const searchCriteria = Object.keys(body)
        .map(key => key + '=' + body[key])
        .join()
    return { criteria: {$and: criteria}, searchCriteria }
}

function generateQuickSearchCriteria(query) {
    const search = query.search.trim().replace(/\?/g, '\\?')
    log.info('Search', search)
    let criteria
    if (/^\d{13,}$/.test(search)) {
        criteria = { 'isbn' : search.slice(0,13) }
    } else if (/\s/.test(search)) {
        const titleCriteria = search.split(/\s+/).map( str => ({'nmTitle' : new RegExp(norm(str),'i')}))
        const authorCriteria = titleCriteria.map(o => ({'nmAuthor':o.nmTitle}))
        criteria = {$or:[{$and:titleCriteria}, {$and:authorCriteria}]}
    } else {
        const crit = new RegExp(norm(search), 'i')
        criteria = {$or: [{ 'nmTitle' : crit }, { 'nmAuthor' : crit }]}
    }
    return { criteria, searchCriteria: search }
}

module.exports = {
    search: doSearch(generateSearchCriteria, 'Recherche avancée'),
    quicksearch: doSearch(generateQuickSearchCriteria, 'Recherche rapide')
}
