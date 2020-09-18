require('dotenv').config();
const ftp = require('basic-ftp');

const database = require('./database');
const fs = require('fs/promises');

if (!process.env.SHOP_ID) {
    console.error('Please provide SHOP_ID env var');
    process.exit(1);
}

const FILENAME = `${process.env.SHOP_ID}_ART.asc`;

const formatItem = (item) => {
    const isbn = item.isbn.padStart(13, '0');
    const amount = String(item.amount).padStart(4, '0');
    const price = String(Math.round(Number(item.price) * 100)).padStart(10, '0');
    return `${process.env.SHOP_ID}${isbn}${amount}${price}`;
};

// toLocaleDateString('fr-FR') only works for node.js version >= 13.
// Other versions only have en-US locale and will produce incorrect results
const date = new Date().toLocaleDateString('fr-FR');
const header = `EXTRACTION STOCK DU ${date}`;

const sendToFtp = async () => {
    const client = new ftp.Client();
    try {
        await client.access({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            password: process.env.FTP_PASSWORD,

        });
        await client.uploadFrom(FILENAME, FILENAME);
    } catch (error) {
        console.error(error);
    }
    client.close();
};

database
    .connect()
    .then((db) =>
        db
            .collection('books')
            .find({ amount: { $gt: 0 }, isbn: /^\d{10,13}$/ })
            .toArray()
    )
    .then((items) => items.map(formatItem))
    .then((lines) => lines.join('\r\n'))
    .then((text) => fs.writeFile(FILENAME, header + '\r\n' + text))
    .then(() => database.close())
    .then(sendToFtp)
    .then(() => console.log('Done.'))
    .catch((error) => {
        console.error(error);
        database.close();
        process.exit(1);
    });
