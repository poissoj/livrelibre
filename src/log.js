'use strict';

const log = level => (...args) => console[level](new Date().toISOString(), ...args);

module.exports = {
    info: log('info'),
    warn: log('warn'),
    error: log('error')
};
