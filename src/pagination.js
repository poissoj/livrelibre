const database = require('./database');
const getCart = require('./getCart');

const ITEMS_PER_PAGE = 50;
const collection = name => database.getDb().collection(name);

function renderItemListPage({ query, sortParams, cardTitle, pageTitle, rootURL, subtitle }) {
    return (pageNumber, res, next) => {
        Promise.all([
            getCart(res.locals.username),
            collection('books').countDocuments(query),
            collection('books')
                .find(query)
                .sort(sortParams)
                .skip((pageNumber - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
                .toArray()
        ])
            .then(([cart, count, results]) => {
                let suffix = '';
                const pageCount = Math.ceil(count / ITEMS_PER_PAGE);
                if (pageCount > 1) {
                    suffix = ` - Page ${pageNumber} sur ${pageCount}`;
                }
                res.render('books', {
                    books: results || [],
                    cart,
                    cardTitle: cardTitle + suffix,
                    pageCount,
                    pageNumber,
                    pageTitle: pageTitle + suffix,
                    rootURL,
                    subtitle: subtitle ? subtitle(count) : ''
                });
            })
            .catch(next);
    };
}

module.exports = renderItemListPage;
