const express = require('express')
const bodyParser = require('body-parser')
const favicon = require('serve-favicon')
const compress = require('compression')
const cookieParser = require('cookie-parser')
const database = require('./database')
const log = require('./log')
const settings = require('./settings')
const createRoutes = require('./createRoutes')

const app = express()

function terminator (sig) {
    database.close()
    if (typeof sig === 'string') {
        log.info('Received ' + sig + ' - terminating ' + app.locals.appName + '…')
        process.exit(1)
    }
    log.info('Node server stopped.')
}

function setupTerminationHandlers () {
    process.on('exit', function() { terminator() });

    // Removed 'SIGPIPE' from the list - bugz 852598.
    ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
        'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
    ].forEach(function(element) {
        process.on(element, function() { terminator(element) })
    })
}

function auth(req, res, next) {
    if (req.url !== '/login' && !req.signedCookies.role) {
        res.redirect('/login')
    } else {
        res.locals.username = req.signedCookies.username
        res.locals.role = req.signedCookies.role
        next()
    }
}

function initializeServer () {

    app.disable('x-powered-by')
    app.set('view engine', 'ejs')
    app.use(compress())
    app.use(express.static('static', { maxAge : 31536000000000 })) // one year
        .use(cookieParser(settings.cookieSecret))
        .use(favicon('static/images/tracteur.png'))
        .use(bodyParser.urlencoded({limit:'50mb', extended:false, parameterLimit: 10000}))
        .use(bodyParser.json({limit:'50mb'}))
        .use(auth)
    app.locals.appName = settings.appName

    createRoutes(app)

    app.use(function(req, res, next) {
        log.warn('404', req.url)
        next({
            status: 404,
            message: 'La page que vous demandez n\'a pas été trouvée.',
            pageTitle: 'Page introuvable'
        })
    })

    /* eslint-disable no-unused-vars */
    app.use(function(err, req, res, next) {
        if (err && err.status !== 404) {
            log.error(err)
        }
        const error = Object.assign({
            status: 500,
            message: 'Oups… Quelque chose s\'est mal passé',
            pageTitle: 'Erreur 500 - erreur interne du serveur'
        }, err)
        res.status(error.status)
        if (req.xhr) {
            res.json(error)
            return
        }
        res.setHeader('Content-Type', 'text/html')
        res.render('page-error', error)
    })
}

function initialize () {
    setupTerminationHandlers()
    initializeServer()
}

function start() {
    database
        .connect()
        .then(() => {
            app.listen(settings.port, function() {
                log.info('Node server started on localhost:' + settings.port + '...')
            })
        })
        .catch(err => {
            log.error('Unable to start server')
            log.error(err)
            process.exit(1)
        })
}

initialize()
start()
