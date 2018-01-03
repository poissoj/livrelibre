'use strict'

const isLeapYear = year => year % 4 === 0 && year % 100 !== 0 || year % 400 === 0

const getDaysInMonth = (year, month) => [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month]

const addMonths = function (date, value) {
    const n = date.getDate()
    date.setDate(1)
    date.setMonth(date.getMonth() + value)
    date.setDate(Math.min(n, getDaysInMonth(date.getFullYear(), date.getMonth())))
    return date
}

module.exports = addMonths
