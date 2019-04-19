'use strict'
const ObjectId = require('mongodb').ObjectId
const getdata = require('./getdata')
const multer = require('multer')
const url = require('url')
const dilicom = require('./dilicom')
const norm = require('./normalize')
const addMonths = require('./date')
const log = require('./log')
const database = require('./database')
const getCart = require('./getCart')
const renderItemListPage = require('./pagination')
const { search, quicksearch } = require('./search')

const storage = multer.memoryStorage()

function formatDate (date) {
    return ('0' + date.getDate()).slice(-2) + '/' + ('0' + (date.getMonth() + 1)).slice(-2) + '/' + date.getFullYear()
}

let APP_NAME
const TYPES = {'postcard':'Carte postale', 'stationery': 'Papeterie', 'game': 'Jeu', 'book': 'Livre', 'unknown':'Inconnu'}

const formatChange = change => change.replace(/(\d\d)$/,',$1€')

function onlyAdmin(req, res, next) {
    if (req.signedCookies.role === 'admin') {
        next()
    } else {
        next({ status: 403, message: 'Accès refusé', pageTitle: 'Accès refusé' })
    }
}

const collection = name => database.getDb().collection(name)

const star = starred => (req, res, next) => {
    collection('books')
        .updateOne({ _id: ObjectId(req.params.id) }, { $set: { starred } })
        .then(result => {
            log.info((starred ? '' : 'un') + 'starred ' + req.params.id)
            if (req.headers.referer && !req.xhr) {
                res.redirect(req.headers.referer)
            } else {
                res.json(result.result)
            }
        })
        .catch(next)
}

const renderListPage = name => renderItemListPage({
    query: {},
    sortParams: { title: 1 },
    cardTitle: 'Tous les articles',
    pageTitle: name + ' - Liste des articles',
    rootURL: '/list?',
    subtitle: count => `${count} articles`
})

function salesByMonth(res, next, month) {
    const salesPromise = collection('sales')
        .aggregate([
            {$match:{deleted:{$exists: false}}},
            {$project:{month:{$substr:['$date',3,7]}, date:1, itemType:1, price:1, tva:1, type:1, quantity:1}},
            {$match:{month}}
        ])
        .toArray()
    Promise.all([getCart(res.locals.username), salesPromise])
        .then(([cart, results]) => {

            const sales = results && results.length ? results : []

            let salesByDay = {}
            let stats = {}
            let itemTypes = {}
            sales.forEach(sale => {

                salesByDay[sale.date] = salesByDay[sale.date] || {nb:0, totalPrice:0}
                salesByDay[sale.date].nb += sale.quantity
                salesByDay[sale.date].totalPrice += sale.price

                const tvaAndType = sale.tva + ',' + sale.type
                stats[tvaAndType] = stats[tvaAndType] || {nb:0, totalPrice:0}
                stats[tvaAndType].nb += sale.quantity
                stats[tvaAndType].totalPrice += sale.price

                itemTypes[sale.itemType] = itemTypes[sale.itemType] || {nb:0, totalPrice:0}
                itemTypes[sale.itemType].nb += sale.quantity
                itemTypes[sale.itemType].totalPrice += sale.price

            })
            salesByDay = Object.keys(salesByDay).sort(function(s1,s2) {
                const d1 = s1.split('/')
                const d2 = s2.split('/')
                return -d1[1].localeCompare(d2[1]) || -d1[0].localeCompare(d2[0])
            }).map(date => ({date, count:salesByDay[date].nb, amount:salesByDay[date].totalPrice.toFixed(2)}))

            stats = Object.keys(stats).map(item => {
                const [tva, typeId] = (item || 'Inconnu,').split(',')
                const type = {'cash':'Espèces', 'card':'Carte bleue', 'check': 'Chèque', 'check-lire': 'Chèque lire'}[typeId] || 'Inconnu'
                return [tva, type, stats[item].nb, stats[item].totalPrice.toFixed(2)]
            })

            itemTypes = Object.keys(itemTypes).map(type => ({
                type:TYPES[type],
                nb:itemTypes[type].nb,
                totalPrice:itemTypes[type].totalPrice.toFixed(2)
            }))

            res.render('sales', {
                cart,
                pageTitle: APP_NAME + ' - Liste des ventes du ' + month,
                sales: salesByDay,
                stats,
                itemTypes,
                cardTitle: 'Liste des ventes du ' + month
            })
        })
        .catch(next)
}

const renderToOrderPage = name => renderItemListPage({
    query: { amount: 0, ordered: false },
    sortParams: { distributor: 1, isbn: 1 },
    cardTitle: 'Articles à renouveler',
    pageTitle: name + ' - Liste des articles à renouveler',
    rootURL: '/zero?',
    subtitle: count => `${count} articles à renouveler`
})

const renderOrderedPage = name => renderItemListPage({
    query: { amount: 0, ordered: true },
    sortParams: { distributor: 1, isbn: 1 },
    cardTitle: 'Articles commandés, en attente',
    pageTitle: name + ' - Liste des articles commandés',
    rootURL: '/ordered?',
    subtitle: count => `${count} articles commandés`
})

const getItemById = (template, pageTitle) => (req, res, next) => {
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
        next()
        return
    }
    const docPromise = collection('books')
        .findOne({_id:ObjectId(req.params.id)})
        .then(doc => {
            if (!doc) {
                throw new Error('404')
            }
            [
                'isbn',
                'author',
                'title',
                'publisher',
                'distributor',
                'keywords',
                'datebought',
                'comments',
                'prix_achat',
                'price',
                'amount',
                'starred'
            ].forEach(function(key) {
                if (!doc[key] && doc[key] !== 0) {
                    doc[key] = ''
                }
            })
            doc.error = false
            doc.pageTitle = APP_NAME + ' - ' + pageTitle + ' - ' + doc.title
            if (req.query.status) {
                doc.message = doc.title + ' modifié.'
            }
            return doc
        })
    const countPromise = docPromise.then(doc =>
        collection('sales')
        .aggregate([
            { $match: { id: ObjectId(doc._id), deleted: { $exists: false } } },
            { $group: { _id: null, total: { $sum: '$quantity' } } }
        ])
        .toArray()
    )
    const lastSalesPromise = docPromise.then(doc =>
            collection('sales').aggregate([
                { $match: { 'id': ObjectId(doc._id), deleted: { $exists: false } } },
                { $project: { 'month': { $substr: ['$date', 3, 2] }, 'year': { $substr: ['$date',6,4] }, quantity: 1 } },
                { $project: { 'date': { $concat: ['$year', '-', '$month'] }, quantity: 1 } },
                { $group: { '_id': '$date', total: { $sum: '$quantity' } } },
                { $sort: { _id: -1 } },
                { $limit: 12 }
            ]).toArray()
    )
    Promise.all([getCart(res.locals.username), docPromise, countPromise, lastSalesPromise])
        .then(([cart, doc, count, lastSales]) => {
            doc.count = count.length > 0 ? count[0].total : 0
            const salesByMonth = []
            const date = new Date()
            for (let i = 0; i < 12; i++) {
                const month = ('0' + (date.getMonth() + 1)).substr(-2)
                const year = date.getFullYear()
                const id = year + '-' + month
                const value = (lastSales.find(x => x._id === id) || { total: 0 }).total
                salesByMonth.push({ id, value })
                addMonths(date, -1)
            }

            res.render(
                template,
                Object.assign(doc, { salesByMonth: JSON.stringify(salesByMonth.reverse()), cart })
            )
        })
        .catch(err => {
            if (err.message === '404') {
                next()
                return
            }
            next(err)
        })
}

function change(doc, res, id) {
    const newDoc = Object.assign({}, doc)
    newDoc.ordered = doc.ordered === 'true' && doc.amount === 0
    newDoc.price = doc.price.replace(',','.')
    newDoc.prix_achat = doc.prix_achat.replace(',','.')
    newDoc.starred = doc.starred === 'true'
    newDoc.nmAuthor = norm(doc.author)
    newDoc.nmTitle = norm(doc.title)
    newDoc.nmPublisher = norm(doc.publisher)
    newDoc.nmDistributor = norm(doc.distributor)
    collection('books')
        .updateOne({ _id: ObjectId(id) }, { $set: newDoc })
        .then(() => {
            log.info(id + ' saved.')
            res.redirect('/show/' + id + '?status=updated')
        })
        .catch(err => {
            log.error('Unable to update record !', err)
            doc.error = true
            doc._id = id
            doc.pageTitle = APP_NAME + ' - Modifier un article'
            getCart(res.locals.username).then(cart => res.render('change', Object.assign({}, doc, { cart })))
        })
}

function ordered(doc, res, id) {
    collection('books').updateOne({_id:ObjectId(id)}, {$set : {ordered:true}})
        .then(() => {
            doc.message = 'Commandé.'
            doc.ordered = true
            doc.error = false
        })
        .catch(err => {
            log.error(err)
            doc.error = true
        })
        .then(() => getCart(res.locals.username))
        .then(cart => {
            doc._id = id
            doc.pageTitle = APP_NAME + ' - Modifier un article'
            res.render('change', Object.assign({}, doc, {cart}))
        })
}

function addToCart(body, res, id, username) {
    const doc = {
        itemId:ObjectId(id),
        type:body.type,
        title:body.title,
        price:body.price,
        tva:body.tva,
        quantity:+body.quantity,
        username
    }
    collection('books')
        .updateOne({ _id: ObjectId(id) }, { $inc: { amount: -body.quantity } })
        .then(collection('cart').insertOne(doc))
        .catch(err => log.error('Error adding to cart', err))
        .then(res.redirect('/show/' + id))
}

function createRoutes (app) {

    app.get('/star/:id', star(true))
    app.get('/unstar/:id', star(false))

    APP_NAME = app.locals.appName

    app
        .route('/login')
        .get(function(req, res) {
            res.render('page-login', { pageTitle: APP_NAME + ' - Se connecter' })
        })
        .post(function(req, res) {
            collection('users')
                .findOne({ name: req.body.username })
                .then(user => {
                    if (user && req.body.password === user.password) {
                        res.cookie('username', user.name, { signed: true })
                        res.cookie('role', user.role, { signed: true })
                        log.info('Auth successfull for ' + user.name)
                        res.redirect('/')
                    } else {
                        log.warn('Auth failed for ' + req.body.username)
                        res.render('page-login', {
                            pageTitle: APP_NAME + ' - Se connecter',
                            message: 'Identifiants invalides'
                        })
                    }
                })
                .catch(error => {
                    log.error(error)
                    res.render('page-login', {
                        pageTitle: APP_NAME + ' - Se connecter',
                        message: 'Erreur de connexion au serveur'
                    })
                })
        })

    app.get('/logout', function(req, res) {
        res.clearCookie('username')
        res.clearCookie('role')
        res.redirect('/login')
    })

    app
        .route('/')
        .get(function(req, res) {
            const booksPromise = collection('books')
                .find({ starred: true })
                .sort({ title: 1 })
                .toArray()
            Promise.all([getCart(res.locals.username), booksPromise]).then(([cart, books]) =>
                res.render('dashboard', {
                    pageTitle: APP_NAME + ' - Tableau de bord',
                    books,
                    cart
                })
            )
        })
        .post(function(req, res, next) {
            if (!req.body) {
                res.redirect('/')
                return
            }
            const price = req.body.price.replace(',', '.')
            log.info('New sale for ' + price + '€ : ' + req.body.title)
            const { username } = res.locals
            const newSale = {
                type: req.body.type,
                title: req.body.title || 'Article indépendant',
                price,
                tva: req.body.tva,
                quantity: 1,
                username
            }
            collection('cart')
                .insertOne(newSale)
                .then(() =>
                    Promise.all([
                        getCart(res.locals.username),
                        collection('books')
                        .find({ starred: true })
                        .sort({ title: 1 })
                        .toArray()
                    ])
                )
                .then(([cart, books]) =>
                    res.render('dashboard', {
                        pageTitle: APP_NAME + ' - Nouvelle vente',
                        message: 'Ajouté au panier.',
                        books,
                        cart
                    })
                )
                .catch(next)
        })

    app.get('/add', function(req, res) {
        getCart(res.locals.username).then(cart =>
            res.render('add', {
                pageTitle: APP_NAME + ' - Ajouter un article',
                date: formatDate(new Date()),
                error: false,
                cart
            })
        )
    })

    app.get('/list', (req, res, next) => renderListPage(app.locals.appName)(Number(req.query.page || 1), res, next))

    app.get('/bestsales', function(req, res, next) {
        const salesPromise = collection('sales')
            .aggregate([
                { $match: { deleted: { $exists: false } } },
                { $group: { _id: '$id', count: { $sum: '$quantity' } } },
                { $sort: { count: -1 } },
                { $limit: 101 }
            ])
            .toArray()
            .then(results => results && results.length ? results.filter(s => s._id !== null) : [])
        const booksPromise = salesPromise.then(sales =>
            collection('books')
            .find({ _id: { $in: sales.map(v => v._id) } })
            .toArray()
        )
        Promise.all([getCart(res.locals.username), salesPromise, booksPromise])
            .then(([cart, sales, books]) => {
                books.forEach(function(book) {
                    let i = 0
                    while (!sales[i]._id.equals(book._id)) {
                        i++
                    }
                    book.count = sales[i].count
                })
                books.sort((b1, b2) => b2.count - b1.count)
                res.render('bestsales', {
                    pageTitle: APP_NAME + ' - Meilleures ventes',
                    books,
                    cart
                })
            })
            .catch(next)
    })

    app.get('/sales', onlyAdmin, function(req, res, next) {
        const salesPromise = collection('sales')
            .aggregate([
                { $match: { deleted: { $exists: false } } },
                {
                    $group: {
                        _id: { month: { $substr: ['$date', 3, 7] } },
                        amount: { $sum: '$price' },
                        count: { $sum: '$quantity' }
                    }
                },
                { $project: { _id: 0, date: '$_id.month', amount: 1, count: 1 } }
            ])
            .toArray()
        Promise.all([getCart(res.locals.username), salesPromise])
            .then(([cart, results]) => {
                const sales =
                    results && results.length
                    ? results.map(function(sale) {
                        sale.amount = +sale.amount.toFixed(2)
                        return sale
                    })
                    : []
                sales.sort(function(s1, s2) {
                    const d1 = s1.date.split('/')
                    const d2 = s2.date.split('/')
                    const year = -d1[1].localeCompare(d2[1])
                    if (year) {
                        return year
                    }
                    return -d1[0].localeCompare(d2[0])
                })
                res.render('sales', {
                    pageTitle: APP_NAME + ' - Liste des ventes par mois',
                    sales,
                    cardTitle: 'Liste des ventes par mois',
                    cart
                })
            })
            .catch(next)
    })

    app
        .route('/sale/:date')
        .get(onlyAdmin, function(req, res, next) {
            const date = req.params.date.replace(/-/g, '/')
            if (date.length === 7) {
                salesByMonth(res, next, date)
                return
            }
            const resultsPromise = collection('sales')
                .aggregate([
                    { $match: { date: date } },
                    { $project: { cartId: 1, id: 1, price: 1, title: 1, tva: 1, type: 1, quantity: 1, deleted: 1 } }
                ])
                .toArray()
            const booksPromise = resultsPromise
                .then(results => {
                    const book_ids = results.map(v => v.id)
                    return collection('books')
                        .find({ _id: { $in: book_ids } })
                        .toArray()
                })
            Promise.all([getCart(res.locals.username), resultsPromise, booksPromise])
                .then(([cart, results, books]) => {
                    const tva = {}
                    let salesCount = 0
                    const sales = results.map(function(s) {
                        let i = 0
                        s.type = {
                            cash: 'Espèces',
                            card: 'Carte bleue',
                            check: 'Chèque',
                            'check-lire': 'Chèque lire'
                        }[s.type]
                        const key = (s.tva || 'Inconnu') + ',' + (s.type || 'Inconnu')
                        if (!tva[key]) {
                            tva[key] = { count: 0, total: 0 }
                        }
                        if (!s.deleted) {
                            tva[key].count += s.quantity
                            tva[key].total += s.price
                            salesCount += s.quantity
                        }
                        if (s.id) {
                            while (!books[i]._id.equals(s.id)) {
                                i++
                            }
                            return Object.assign({}, books[i], {
                                sale_item_id: [s._id, s.id].join(),
                                price: s.price,
                                type: s.type,
                                cartId: s.cartId,
                                quantity: s.quantity,
                                deleted: s.deleted
                            })
                        }
                        return Object.assign({}, s, { sale_item_id: s._id })
                    })
                    res.render('sale', {
                        pageTitle: APP_NAME + ' - Ventes du ' + date + ' (' + salesCount + ')',
                        items: sales || [],
                        tva,
                        date,
                        salesCount,
                        cart
                    })
                })
                .catch(next)
        })
        .post(function(req, res, next) {
            if (req.body && req.body.id) {
                const id = req.body.id.split(',')
                collection('sales')
                    .findOneAndUpdate({ _id: ObjectId(id[0]) }, { $set: { deleted: true } })
                    .then(r => {
                        const item = r.value
                        log.info(`Deleted sale ${item.id} (${item.quantity} * ${item.price}€ - ${item.date})`)
                        return item
                    })
                    .then(item => {
                        if (id[1]) {
                            const amount = item.quantity || 1
                            return collection('books').findOneAndUpdate({ _id: ObjectId(id[1]) }, { $inc: { amount } })
                        }
                        return { value: item }
                    })
                    .then(r => {
                        const item = r.value
                        log.info(`Item deleted : ${item.title} by ${item.author}`)
                        res.redirect('/sale/' + req.params.date)
                    })
                    .catch(next)
            }
        })

    app.get('/zero', (req, res, next) => renderToOrderPage(app.locals.appName)(Number(req.query.page || 1), res, next))
    app.get('/ordered', (req, res, next) => renderOrderedPage(app.locals.appName)(Number(req.query.page || 1), res, next))

    app.get('/search', function(req, res) {
        getCart(res.locals.username).then(cart =>
            res.render('search', { pageTitle: APP_NAME + ' - Chercher un article', cart })
        )
    })

    app.get('/advanced', onlyAdmin, function(req, res) {
        getCart(res.locals.username).then(cart => res.render('advanced', { pageTitle: APP_NAME + ' - Avancé', cart }))
    })

    app.get('/show/:id', getItemById('item', 'Voir un article'))

    app
        .route('/update/:id')
        .get(getItemById('change', 'Modifier un article'))
        .post(function(req, res) {
            if (req.body) {
                const id = req.params.id
                const submit = req.body.submit
                req.body.amount *= 1
                delete req.body.submit
                log.info(submit, req.body, id)
                const action = { Modifier: change, 'Ajouter au panier': addToCart, Commandé: ordered }[
                    submit
                ]
                if (action) {
                    action(req.body, res, id, res.locals.username)
                }
            } else {
                res.redirect('/')
            }
        })

    app.get('/get/book/:isbn', function(req, res) {
        getdata(req.params.isbn, function(data) {
            res.setHeader('Content-Type', 'application/json')
            res.send(data)
        })
    })

    app.get('/export', onlyAdmin, function(req, res, next) {
        log.info('Export data...')
        const formatNumber = v => v ? v.replace('.', ',') : ''
        collection('books')
            .aggregate([
                { $match: { amount: { $ne: 0 } } },
                { $project: { _id: 0, title: 1, author: 1, distributor: 1, amount: 1, prix_achat: 1, price: 1, type: 1 } },
                { $sort: { distributor: 1, author: 1, title: 1 } }
            ])
            .toArray()
            .then(books => {
                const trim = str => str ? str.trim() : ''
                const header = 'Catégorie,Titre,Auteur,Distributeur,Qté,Prix achat,Valeur TTC'
                const csv =
                    header +
                    '\n' +
                    books
                    .map(book =>
                        [
                            '"' + TYPES[book.type] + '"',
                            '"' + trim(book.title) + '"',
                            '"' + trim(book.author) + '"',
                            '"' + trim(book.distributor) + '"',
                            book.amount,
                            '"' + formatNumber(book.prix_achat) + '"',
                            '"' + formatNumber(book.price) + '"'
                        ].join()
                    )
                    .join('\n')
                res.attachment('stocks.csv')
                res.send(csv)
                log.info('exported ' + books.length + ' items.')
            })
            .catch(next)
    })

    app
        .route('/cart')
        .get(function(req, res, next) {
            let message
            const p = url.parse(req.url, true)
            if (p.query.a) {
                log.info('Cart, change = ' + p.query.a)
                message = 'À rendre : ' + formatChange(p.query.a)
            }
            const { username } = res.locals
            Promise.all( [
                collection('cart').find({ username }).toArray(),
                collection('asideCart').find({ username }).toArray()
            ]).then(([results, asideItems]) => {
                    const total = (results.reduce((sum, item) => sum + item.price * item.quantity * 100, 0) / 100).toFixed(2)
                    const count = results.reduce((sum, item) => sum + item.quantity, 0)
                    const items = results.map(item => Object.assign(item, { sale_item_id: [item._id, item.itemId].join() }))
                    const asideTotal = (asideItems.reduce((sum, item) => sum + item.price * item.quantity * 100, 0) / 100).toFixed(2)
                    const asideCount = asideItems.reduce((sum, item) => sum + item.quantity, 0)
                    res.render('cart', {
                        pageTitle: APP_NAME + ' - Panier',
                        items,
                        total,
                        date: formatDate(new Date()),
                        message,
                        cart: { count },
                        asideTotal,
                        asideCount
                    })
            })
            .catch(next)
        })
        .post(function(req, res, next) {
            const redirectToCart = () => res.redirect('/cart')
            if (!req.body || !req.body.action) {
                redirectToCart()
                return
            }
            const { username } = res.locals
            if (req.body.action === 'put-aside') {
                // TODO: check if asideCart is empty
                log.info(`Set cart aside (${username})`)
                collection('cart')
                    .find({ username })
                    .toArray()
                    .then(items => collection('asideCart').insert(items))
                    .then(() => collection('cart').remove({ username }))
                    .then(redirectToCart)
                    .catch(next)
            } else if (req.body.action === 'reactivate') {
                // TODO: check if cart is empty
                log.info(`Reactivate aside cart (${username})`)
                collection('asideCart')
                    .find({ username })
                    .toArray()
                    .then(items => collection('cart').insert(items))
                    .then(() => collection('asideCart').remove({ username }))
                    .then(redirectToCart)
                    .catch(next)
            } else {
                redirectToCart()
            }
        })

    app.get('/stats', function(req, res, next) {
        const salesPromise = collection('sales')
            .find({ deleted: { $exists: false } }, { _id: 1 })
            .toArray()
        Promise.all([getCart(res.locals.username), salesPromise])
            .then(([cart, sales]) => {
                const hours = sales.map(sale => sale._id.getTimestamp().getHours())
                const days = sales.map(sale => sale._id.getTimestamp().getDay())
                res.render('stats', {
                    pageTitle: APP_NAME + ' - Statistiques',
                    hours: JSON.stringify(hours),
                    days: JSON.stringify(days),
                    cart
                })
            })
            .catch(next)
    })

    app.get('/cart/add/:id', function(req, res, next) {
        collection('books')
            .findOneAndUpdate({ _id: ObjectId(req.params.id) }, { $inc: { amount: -1 } })
            .then(result => {
                const item = result.value
                const doc = {
                    itemId: ObjectId(item._id),
                    type: item.type,
                    title: item.title,
                    price: item.price,
                    tva: item.tva,
                    quantity: 1,
                    username: res.locals.username
                }
                log.info('Add ' + doc.title + ' (' + item._id + ') to cart')
                return doc
            })
            .then(doc => collection('cart').insertOne(doc))
            .then(() => {
                if (req.xhr) {
                    res.json({status: 'OK'})
                } else {
                    res.redirect(req.headers.referer || '/')
                }
            })
            .catch(next)
    })

    app.post('/doadd', function(req, res, next) {
        if (!req.body) {
            res.redirect('/add')
            return
        }
        if (req.body.author === '' || req.body.title === '') {
            getCart(res.locals.username).then(cart => res.render('add', {
                pageTitle: APP_NAME + ' - Ajouter un article',
                date: formatDate(new Date()),
                message: 'Le titre et l\'auteur sont obligatoires',
                cart
            }))
            return
        }
        const doc = {
            pageTitle: APP_NAME + ' - Ajouter un article',
            date: formatDate(new Date())
        }
        collection('books')
            .findOne({ isbn: req.body.isbn })
            .then(book => {
                if (book !== null && book.isbn !== '') {
                    doc.message = req.body.title + ' : Ce livre existe déjà'
                    return doc
                }
                const newBook = Object.assign({}, req.body)
                newBook.amount *= 1
                newBook.ordered = false
                newBook.price = newBook.price.replace(',', '.')
                newBook.prix_achat = newBook.prix_achat.replace(',', '.')
                newBook.nmAuthor = norm(newBook.author)
                newBook.nmTitle = norm(newBook.title)
                newBook.nmPublisher = norm(newBook.publisher)
                newBook.nmDistributor = norm(newBook.distributor)
                log.info('Add new item:', newBook)
                doc.title = newBook.title
                return collection('books')
                    .save(newBook)
                    .then(() => { log.info('saved.') })
                    .catch(err => {
                        log.error('Unable to save record !', err)
                        doc.message = 'Erreur lors de l\'enregistrement'
                    })
                    .then(() => doc)
            })
            .then(doc => Promise.all([getCart(res.locals.username), doc]))
            .then(([cart, doc]) => res.render('add', Object.assign({}, doc, {cart})))
            .catch(next)

    })

    app.get('/dosearch', search)
    app.get('/quicksearch', quicksearch)

    app.post('/cart/pay', function(req, res, next) {
        if (!req.body) {
            res.redirect('/')
            return
        }
        let param = ''
        const { username } = res.locals

        collection('cart')
            .find({ username })
            .toArray()
            .then(items => {
                if (items.length === 0) {
                    throw new Error('No items in cart')
                }
                log.info('Paying cart in ' + req.body.type + ', ' + items.length + ' items')
                const cartId = items[0]._id
                const sales = items.map(item => ({
                    cartId,
                    date: req.body.date,
                    id: item.itemId,
                    itemType: item.type,
                    price: Math.round(item.price * item.quantity * 100) / 100,
                    quantity: item.quantity,
                    title: item.title,
                    tva: item.tva,
                    type: req.body.type
                }))
                const total = sales.reduce((t,sale) => t + sale.price * 100, 0)
                if (req.body.type === 'cash') {
                    param = '?a=' + Math.round(req.body.amount.replace(',','.') * 100 - total)
                }
                return sales
            })
            .then(sales => collection('sales').insertMany(sales))
            .then(() => collection('cart').deleteMany({ username }))
            .then(() => res.redirect('/cart' + param))
            .catch(err => {
                if (err.message === 'No items in cart') {
                    res.redirect('/cart')
                    return
                }
                next(err)
            })
    })

    app.post('/cart/remove', function(req, res) {

        if (!req.body || !req.body.id) {
            res.redirect('/')
            return
        }

        const id = req.body.id.split(',')
        collection('cart')
            .findOneAndDelete({ _id: ObjectId(id[0]) })
            .then(result => {
                if (result.value) {
                    log.info('Removed ' + result.value.title + ' from cart')
                }
                if (id[1] && id[1].length && result.value) {
                    const amount = result.value.quantity || 1
                    return collection('books').updateOne({ _id: ObjectId(id[1]) }, { $inc: { amount } })
                }
                return undefined
            })
            .catch(err => log.error(err))
            .then(() => {
                if (req.xhr) {
                    getCart(res.locals.username).then(cart => res.json(cart))
                } else {
                    res.redirect('/cart')
                }
            })

    })

    app.post('/import', onlyAdmin, multer({ storage }).single('dilicom'), function(req, res, next) {
        if (!req.file) {
            res.redirect('/advanced')
            return
        }
        const data = dilicom.parse(req.file.buffer.toString())
        data.filename = req.file.originalname
        log.info('Importing ' + data.filename)
        const LENGTH = data.books.length
        if (LENGTH === 0) {
            getCart(res.locals.username).then(cart =>
                res.render('importList', { pageTitle: APP_NAME + ' - Importer un fichier DILICOM', data, cart })
            )
            return
        }
        let count = 1
        function cb(n, book_data) {
            Object.assign(data.books[n], book_data)
            if (count++ === LENGTH) {
                getCart(res.locals.username).then(cart =>
                    res.render('importList', { pageTitle: APP_NAME + ' - Importer un fichier DILICOM', data, cart })
                )
            }
        }
        const book_EAN = data.books.map(book => book.EAN + '')
        collection('books')
            .find({ isbn: { $in: book_EAN } })
            .toArray()
            .then(books => {
                const eans = books.map(book => book.isbn)
                for (let i = 0; i < LENGTH; i++) {
                    const index = eans.indexOf(book_EAN[i])
                    if (index === -1) {
                        getdata(book_EAN[i], cb.bind(this, i))
                    } else {
                        cb(i, books[index])
                    }
                }
            })
            .catch(next)

    })

    app.post('/finalizeImport', onlyAdmin, function(req, res) {
        const data = JSON.parse(req.body.data)
        log.info('finalizeImport', data.filename)

        function render(err) {
            getCart(res.locals.username).then(cart =>
                res.render('advanced', {
                    pageTitle: APP_NAME + ' - Importer un fichier DILICOM',
                    message: err || 'Fichier importé.',
                    cart
                })
            )
        }

        if (req.body.price.some(price => price.length === 0)) {
            getCart(res.locals.username).then(cart =>
                res.render('importList', {
                    pageTitle: APP_NAME + ' - Importer un fichier DILICOM',
                    error: 'Merci de renseigner tous les prix.',
                    data,
                    cart
                })
            )
        } else {
            const today = formatDate(new Date())
            const booksToAdd = []
            data.books.forEach((book,i) => {
                const price = req.body.price[i].replace(',','.')
                if (book._id) {
                    collection('books').updateOne({_id:ObjectId(book._id)}, {$inc: {amount:book.qty}, $set: { price }})
                } else {
                    book.amount = book.qty
                    book.datebought = today
                    book.isbn = book.EAN + ''
                    book.ordered = false
                    book.price = price
                    book.tva = '5.5'
                    book.type = 'book'
                    book.nmAuthor = norm(book.author)
                    book.nmTitle = norm(book.title)
                    book.nmPublisher = norm(book.publisher)
                    book.nmDistributor = norm(book.distributor)
                    delete book.EAN
                    delete book.qty
                    delete book.availability
                    delete book.total
                    booksToAdd.push(book)
                }
            })
            if (booksToAdd.length) {
                collection('books').insertMany(booksToAdd, render)
            } else {
                render()
            }
        }
    })

}

module.exports = createRoutes

