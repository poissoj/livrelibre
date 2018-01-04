const settings = {
    port: process.env.PORT || 8888,
    appName: process.env.APP_NAME || 'Livre Libre',
    cookieSecret: process.env.COOKIE_SECRET || '38cwimbiaJO9MDYMNZRX2jT',
    connection_string: process.env.MONGOLAB_URL || 'mongodb://127.0.0.1:27017/tsavant'
}
module.exports = settings
