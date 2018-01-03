'use strict'

const harb = require('harb')

function parse(string) {
    let h = harb.read(string)
    const data = { books: [] }
    if (h.Sheets && h.Sheets.Sheet1) {
        h = h.Sheets.Sheet1
        if (h.A9 && h.A9.v === 'EAN') {
            data.date = h.B2.v
            data.libraryId = h.B4.v
            data.libraryName = h.B5.v
            let row = 10
            const g = l => h[l + row] ? h[l + row].v : ''
            while (h['A' + row]) {
                const book = {
                    EAN :         g('A'),
                    title:        g('B'),
                    author:       g('C'),
                    publisher:    g('D'),
                    distributor:  g('E'),
                    price:        g('F'),
                    availability: g('G'),
                    ref:          g('H'),
                    qty:          g('I'),
                    total:        g('J')
                }
                data.books.push(book)
                row++
            }
            data.qty = g('I')
            data.total = g('J')
        }
    }
    return data
}

module.exports = { parse }
