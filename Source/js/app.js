/* closest element polyfill */
this.Element && function(ElementPrototype) {
    ElementPrototype.matches = ElementPrototype.matches ||
    ElementPrototype.matchesSelector ||
    ElementPrototype.webkitMatchesSelector ||
    ElementPrototype.msMatchesSelector ||
    function(selector) {
        let node = this, nodes = (node.parentNode || node.document).querySelectorAll(selector), i = -1;
        while (nodes[++i] && nodes[i] != node);
        return !!nodes[i];
    }
}(Element.prototype);

// closest polyfill
this.Element && function(ElementPrototype) {
    ElementPrototype.closest = ElementPrototype.closest ||
    function(selector) {
        let el = this;
        while (el.matches && !el.matches(selector)) el = el.parentNode;
        return el.matches ? el : null;
    }
}(Element.prototype);


/* get data from NASA astronamy picture of the day */
const loadData = () => {
    const baseUrl = 'https://api.nasa.gov/planetary/apod'
    const apikey = '?api_key=Ttg3Vd2vjmC8Farpan7388ADk8qvouainijhhQDO';
    const params = '&count=6';

    fetch(`${baseUrl}${apikey}${params}`)
        .then(function(response) {
            return response.json();
        })
        .then(function(myJson) {
            myJson.map(item => {
                articleTemplate(item, false);
            })
            return myJson;
        })
        .then(function(myJson){
            /* loading click events here so binding happens after the map function otherwise clicks don't work */  
            loadClickEvents(myJson);
        });
}

const loadClickEvents = (data) => {
    /* toggle read more */
    let readMoreToggle = (e) => {
        let elem = e.currentTarget;
        elem.previousElementSibling.classList.toggle('show');
        if(elem.firstChild.nodeValue == 'READ MORE') {
            elem.innerHTML = 'READ LESS';
        } else {
            elem.innerHTML = 'READ MORE';
        }
    }
    let toggleExpand = document.getElementsByClassName('toggle-expand');
    for (let i = 0; i < toggleExpand.length; i++) {
        toggleExpand[i].addEventListener('click', readMoreToggle, false);
    }

    /* toggle favorite */
    let favoriteToggle = (e) => {
        let elem = e.currentTarget;
        let closestElem = elem.closest('article');
        closestElem.classList.toggle('favorite');
        elem.classList.toggle('favorite');

        /* get index of clicked element and return it */
        const index = [...elem.parentElement.parentElement.parentElement.children].indexOf(closestElem)
        
        /* only save to local storage if this item has been toggle to favorite */
        if(closestElem.classList.contains('favorite')) {
            setLocalStorage(index, data);
        } else {
            /* if I have time let's remove this item for local storage if we toggle off */
        }
    }
    let favBtn = document.getElementsByClassName('fav-btn');
    for (let i = 0; i < toggleExpand.length; i++) {
        favBtn[i].addEventListener('click', favoriteToggle);
    }

    /* add card from footer form */
    let addCustomCard = (e) => {
        e.preventDefault();
        console.log('add custom card');

        let formData = new FormData(addCardForm);
        let formFieldData = myObject = {
            date: Math.random().toString(36).substring(7),
            title: formData.get('title'),
            url: formData.get('image'),
            explanation: formData.get('description')
        }
        console.log(formFieldData);

        articleTemplate(formFieldData, false);
        let updatedData = data.slice();
        updatedData.push(formFieldData);

        loadClickEvents(updatedData);
    }
    const addCardForm = document.getElementById('add-card');
    addCardForm.addEventListener("submit", addCustomCard);
}

/* set template for elements and load them into the load elements into DOM */
const articleTemplate = (data, favorite) => {
    let template = `<div class="article-header">
        <h2>${data.title}</h2>
        <div class="img" style="background-image: url(${data.url})"></div>
    </div>
    <div class="article-content">
        <div class="description">
            ${data.explanation}
        </div>
        <p class="toggle-expand">READ MORE</p>
        <button class="fav-btn"><span class="heart"></span>FAVORITE</button>
    </div>`;


    /* set up each items parent here */
    const card = document.createElement('article');
    card.classList.add('card');

    /* if we've determined this was already a favorite, mark it so on page load */
    favorite === true ? card.classList.add('favorite') : null;

    /* set content variable and load it into the page */
    card.innerHTML = template;
    document.getElementById('card-parent').appendChild(card);
}


/* -make our favorited item into a string and save that to local storage */
setLocalStorage = (index, apiData) => {
    let myStorage = window.localStorage;
    let newIndex = index - myStorage.length;

    localStorage.setItem(JSON.stringify(apiData[newIndex].date), JSON.stringify(apiData[newIndex]));

    /* reset page content to reflect new order of items */
    newData = apiData.slice();
    newData.splice(newIndex, 1);
    
    /* I'm passing true into the function becasue that will just reload the content and not the whole page */
    /* I'm also passing the date from the clicked item so I can skip that and not load it twice */
    pageLoad(true, newData, apiData[newIndex].date);
}


/* when page loads check for items saved to local storage and load those first then load from the API */
let pageLoad = (refresh, data, savedItemDate) => { 
    
    if(refresh) {
        let el = document.getElementById('card-parent');
        el.innerHTML = '';
    }

    let myStorage = window.localStorage;
    if(myStorage.length > 0 ) {
        /* if there's info saved in local storage load those items first */        
        let promise1 = new Promise(function(resolve, reject) {
            let arrFavs = [];
            for (let i = 0; i < myStorage.length; i++) {
                let thisLocalItem = JSON.parse(myStorage.getItem(myStorage.key(i)));
                arrFavs[i] = JSON.parse(myStorage.getItem(myStorage.key(i)));
            }
            arrFavs.map(item => {
                articleTemplate(item, true);
            });
            resolve('Success!');
        });

        /*  */
        promise1.then(function(value){
            if(refresh) {
                /* this is to just refresh the page content without page load */
                data.map(item => {
                    articleTemplate(item, false);
                });

                loadClickEvents(data);
            } else {
                /* this is to collect data from the API on initial load */
                loadData();
            }
        });

    } else {
        /* if there's no local storage load the page like normal */
        loadData();
    }
}


/* clear local storage */
const clearLocalStorage = () => {
    let myStorage = window.localStorage;
    if(myStorage.length > 0) {
        localStorage.clear();
        let el = document.getElementById('card-parent');
        el.innerHTML = '';
        pageLoad(false, false, false);
    }
}
let clearFavs = document.getElementById('clear-favorites');
clearFavs.addEventListener('click', clearLocalStorage, false);


/* I'm passing false into the function becasue I'm not trying to just reset page data without reload */
pageLoad(false, false, false);
