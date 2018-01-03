import { Role, Selector } from 'testcafe';

const HOSTNAME = 'http://localhost:7777';

const admin = Role(HOSTNAME + '/login', async t => {
    await t
        .typeText('input[name=username]', 'admin')
        .typeText('input[name=password]', 'admin')
        .click('button[type=submit]');
});

/* eslint-disable no-unused-expressions */
fixture `Authentication`
    .page `${HOSTNAME}`;

test('Displays login page if not authentified', async t => {
    await t
        .expect(Selector('.login-head').innerText)
        .eql('CONNEXION');
});

test('Wrong login displays error', async t => {
    await t
        .typeText('input[name=username]', 'admin')
        .click('button[type=submit]')
        .expect(Selector('.text-danger').innerText)
        .eql(' Identifiants invalides');
});

test('Correct login goes to Dashboard', async t => {
    await t
        .useRole(admin)
        .navigateTo(HOSTNAME)
        .expect(Selector('.sidebar-menu .active').innerText)
        .eql('Tableau de bord\n');
});


/* eslint-disable no-unused-expressions */
fixture `Simple routes`
    .page `${HOSTNAME}`;

test('Displays search page', async t => {
    await t
        .useRole(admin)
        .navigateTo(HOSTNAME + '/search')
        .expect(Selector('.card-title').innerText)
        .eql('Chercher un article');
});

test('Displays "Add item" page', async t => {
    await t
        .useRole(admin)
        .navigateTo(HOSTNAME + '/add')
        .expect(Selector('.card-title').innerText)
        .eql('Ajouter un article');
});

test('Displays sales page', async t => {
    await t
        .useRole(admin)
        .navigateTo(HOSTNAME + '/sales')
        .expect(Selector('.card-title').innerText)
        .eql('Liste des ventes par mois');
});

test('Displays "All items" page', async t => {
    await t
        .useRole(admin)
        .navigateTo(HOSTNAME + '/list')
        .expect(Selector('.card-title').nth(1).innerText)
        .eql('Tous les articles')
        .expect(Selector('.card-body>p').innerText).eql('0 articles');
});

test('Displays "Items to order" page', async t => {
    await t
        .useRole(admin)
        .navigateTo(HOSTNAME + '/zero')
        .expect(Selector('.card-title').nth(1).innerText)
        .eql('Articles à renouveler')
        .expect(Selector('.card-body>p').innerText).eql('0 articles à renouveler');
});

test('Displays "Items ordered" page', async t => {
    await t
        .useRole(admin)
        .navigateTo(HOSTNAME + '/ordered')
        .expect(Selector('.card-title').nth(1).innerText)
        .eql('Articles commandés, en attente')
        .expect(Selector('.card-body>p').innerText).eql('0 articles commandés');
});

test('Displays "Best sales" page', async t => {
    await t
        .useRole(admin)
        .navigateTo(HOSTNAME + '/bestsales')
        .expect(Selector('.card-title').innerText)
        .eql('Meilleures ventes');
});

test('Displays Stats page', async t => {
    await t
        .useRole(admin)
        .navigateTo(HOSTNAME + '/stats')
        .expect(Selector('.card-title').innerText)
        .eql('Nombre de ventes par heure');
});

test('Displays Advanced page', async t => {
    await t
        .useRole(admin)
        .navigateTo(HOSTNAME + '/advanced')
        .expect(Selector('.card-title').innerText)
        .eql('Importer un fichier DILICOM');
});

/* eslint-disable no-unused-expressions */
fixture `Actions`;

test('Add a new item', async t => {
    const typeSelect = Selector('#type');
    await t
        .useRole(admin)
        .navigateTo(HOSTNAME + '/add')
        .click(typeSelect)
        .click(typeSelect.find('option').withText('Livre'))
        .expect(typeSelect.value).eql('book')
        .typeText('#isbn', '1234567890')
        .typeText('#author', 'Auteur')
        .typeText('#title', 'Super bouquin')
        .typeText('#publisher', 'Éditeur')
        .typeText('#distributor', 'Distributeur')
        .typeText('#price', '10')
        .typeText('#amount', '00')
        .click('button[type=submit]')
        .expect(Selector('.alert-success').innerText).contains('Super bouquin enregistré.');
});

test('Displays newly added item in "All items" page', async t => {
    await t
        .useRole(admin)
        .navigateTo(HOSTNAME + '/list')
        .expect(Selector('.card-title').nth(1).innerText)
        .eql('Tous les articles')
        .expect(Selector('.card-body>p').innerText).eql('1 articles')
        .expect(Selector('table a').innerText)
        .eql('Super bouquin');
});

test('Search inexistent item', async t => {
    await t
        .useRole(admin)
        .navigateTo(HOSTNAME)
        .typeText('input[name=search]', 'not in database')
        .click('#search')
        .expect(Selector('.card-title').nth(1).innerText).eql('Recherche rapide')
        .expect(Selector('.card-body>p').innerText).eql('Aucun résultat pour not in database');
});

test('Search newly added book', async t => {
    await t
        .useRole(admin)
        .navigateTo(HOSTNAME)
        .typeText('input[name=search]', 'Super bouquin')
        .click('#search')
        .expect(Selector('.card-title').nth(1).innerText).eql('Recherche rapide')
        .expect(Selector('.card-body>p').innerText).eql('1 résultat pour Super bouquin')
        .expect(Selector('.card-body>table a').innerText).eql('Super bouquin');

    t.fixtureCtx.bookPageURL = await Selector('.card-body>table a').getAttribute('href');
});

test('Add item to cart', async t => {
    await t
        .useRole(admin)
        .navigateTo(HOSTNAME + t.fixtureCtx.bookPageURL)
        .expect(Selector('.card-title').innerText).eql('Super bouquin')
        .expect(Selector('.card-body>table tr').nth(11).find('td').nth(1).innerText).eql('100')
        .click('#addToCart')
        .expect(Selector('.card-body>table tr').nth(11).find('td').nth(1).innerText).eql('99')
        .expect(Selector('.badge').innerText).eql('1');
});

test('Validate cart', async t => {
    await t
        .useRole(admin)
        .navigateTo(HOSTNAME)
        .click('a[title="Voir le panier"]')
        .expect(Selector('.card-title').innerText).eql('Panier - 1 article')
        .click('button[name=pay]')
        .expect(Selector('.badge').innerText).eql('0')
        .expect(Selector('.card-title').innerText).eql('Panier')
        .expect(Selector('.card-body > .alert-info').innerText).contains('À rendre :')
        .expect(Selector('.card-body').innerText).contains('Aucun article dans le panier');
});

test('Star item', async t => {
    await t
        .useRole(admin)
        .navigateTo(HOSTNAME + t.fixtureCtx.bookPageURL)
        .expect(Selector('.star > i').hasClass('fa-star-o')).ok()
        .click('.star')
        .expect(Selector('.star > i').hasClass('fa-star')).ok()
        .navigateTo(HOSTNAME)
        .expect(Selector('.itemList').childElementCount).eql(1)
    ;
});
