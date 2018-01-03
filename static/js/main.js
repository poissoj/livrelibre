function initDOMevents() {
    'use strict';

    var xhr = null;
    function getBookInfo() {
        var isbn = document.getElementById("isbn").value
        var url = "/get/book/" + isbn
        if (xhr && xhr.readyState < 4 || !/\d{8,}/.test(isbn)) { return }
        var i = document.getElementById('search').firstElementChild
        i.classList.remove('fa-search')
        i.classList.add('fa-spinner', 'fa-spin')
        xhr = new XMLHttpRequest()
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var data = JSON.parse(xhr.responseText)
                i.classList.remove('fa-spinner', 'fa-spin')
                i.classList.add('fa-search')
                if (data.error) {
                    console.log("error", data.error)
                    var card = document.getElementsByClassName('card-body')[0]
                    var messageContent = '<div class="alert alert-dismissible alert-danger fade in">\n' +
                        '<button class="close" type="button" data-dismiss="alert">×</button>\n' +
                        'Aucune info trouvé pour l\'ISBN ' + isbn + '\n' +
                        '</div>'
                    var div = document.createElement('div')
                    div.innerHTML = messageContent
                    card.insertBefore(div, card.firstChild)
                    new Alert(div.firstChild)
                } else {
                    document.getElementById("author").value = data.author
                    document.getElementById("title").value = data.title
                    document.getElementById("publisher").value = data.publisher
                }
            }
        }
        xhr.open( "GET", url, true )
        xhr.send()
    }

    var search = document.getElementById("search")
    var form = document.querySelector("form")
    var inputISBN = document.getElementById("isbn")
    if (search && form && inputISBN) {
        search.addEventListener("click", getBookInfo)
        form.addEventListener("submit", function(e) {
            if (document.activeElement === inputISBN) {
                e.preventDefault()
                getBookInfo()
            }
        })
    }
}

document.addEventListener('DOMContentLoaded', initDOMevents);

function handleStar(e) {
    e.preventDefault();
    var a = e.target;
    if (a.nodeName !== 'A') {
        a = a.parentElement;
    }
    var i = a.firstChild;
    i.classList.remove('fa-star', 'fa-star-o');
    i.classList.add('fa-spinner', 'fa-spin');
    var request = new XMLHttpRequest();
    request.onload = function() {
        i.classList.remove('fa-spinner', 'fa-spin');
        if (request.status >= 200 && request.status < 400) {
            if (/unstar/.test(a.href)) {
                a.href = a.href.replace('unstar', 'star');
                i.classList.add('fa-star-o');
                a.title = 'Ajouter aux favoris';
            } else {
                a.href = a.href.replace('star', 'unstar');
                i.classList.add('fa-star');
                a.title = 'Enlever des favoris';
            }
        } else {
            console.error('Unable to star/unstar');
            console.log(request);
        }
    }
    request.onerror = function() {
        i.classList.remove('fa-spinner', 'fa-spin');
        console.error('Unable to star/unstar');
        console.log(request);
    }
    request.open('GET', a.href);
    request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    request.send();
}

function handleStars(selector) {
    var container = document.querySelector(selector);
    if (!container) {
        return;
    }
    container.addEventListener('click', function clickedOnContainer(e) {
        if (/a|i/i.test(e.target.nodeName) && /star/.test(e.target.className)) {
            handleStar(e);
        }
    })
}

function formatDate (date) {
    return ('0' + date.getDate()).slice(-2) + '/' + ('0' + (date.getMonth() + 1)).slice(-2) + '/' + date.getFullYear()
}

function datepicker(id) {

    var inputDate = document.getElementById(id);

    if (!inputDate) {
        return;
    }

    new Pikaday({
        field: inputDate,
        firstDay: 1,
        i18n: {
            months: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
            weekdays:['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
            weekdaysShort:['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.']
        },
        defaultDate: inputDate.value,
        toString: formatDate,
        parse: function(dateString) {
            var parts = dateString.split('/');
            var day = parseInt(parts[0], 10);
            var month = parseInt(parts[1], 10) - 1;
            var year = parseInt(parts[2], 10);
            return new Date(year, month, day);
        }
    })
}
