let gamesData;
let favorite = [];
const api = 'https://free-to-play-games-database.p.rapidapi.com/api/games';
const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': '554bdbcf7fmshad8fab0cfbcf624p196aa5jsn5bc4c284f1f7',
		'X-RapidAPI-Host': 'free-to-play-games-database.p.rapidapi.com'
	}
};

let sortOrder = true; // true for ascending, false for descending
let displayQty;
let filter;

const active = 'active';
const dataFilter = '[data-filter]';

//* filtering variables
const filterLink = document.querySelectorAll(dataFilter);
const searchBox = document.querySelector('#search');
const gameItems = document.querySelectorAll(dataFilter);

//* genre legend
const legendContainer = document.querySelector('.legend-container');
const legendItems = legendContainer.querySelectorAll('.legend-item');

//* dropdown variables
const selected = document.querySelector('.selected');
const optionContainer = document.querySelector('.options-container');
const optionList = document.querySelectorAll('.option');

fetch(api, options)
  .then(response => response.json())
  .then(data => {
    if (!data) throw new Error("No data received from API");

    gamesData = data;
    displayData(data);
  })
  .catch(err => {
    console.log(err);
    console.log("Displaying error message to the user");
  });

//* set elements as active
const setActive = (elm, selector) => {
  if (document.querySelector(`${selector}.${active}`) !== null) {
    document.querySelector(`${selector}.${active}`).classList.remove(active);
  } 
  elm.classList.add(active)
}  

//* filter via nav options

for (const link of filterLink) {
  link.addEventListener('click', function() {
    setActive(link, '.filter-link');
    filter = this.dataset.filter;
    if (filter === "all") {
      return displayData(gamesData);
    } else if (filter === "favorite") {
      return displayData(favorite);
    }
    return  displayData(sortData(gamesData, filter));
  });

  //* double click for ascending/descending
  link.addEventListener('dblclick', () => {
    sortOrder = !sortOrder;
  });
}

//* filter via search bar

searchBox.addEventListener('keyup', (e) => {
  const searchInput = e.target.value.toLowerCase().trim();
  const filter = document.querySelectorAll('.filter-link');
  sortOrder = true;
  
  if(searchInput === ""){
    return displayData(gamesData);
  }
  filter.forEach(link => {
    const filterValue = link.dataset.filter;

    if (filterValue.includes(searchInput) && searchInput.length >= 3) {
      return displayData(sortData(gamesData, filterValue));
    } 
  });
});

//* dropdown selection
selected.addEventListener('click', () => {
  // toggle active on/off
  optionContainer.classList.toggle("active");
})

optionList.forEach((option) => {
  option.addEventListener('click', () => {
    selected.innerHTML = option.querySelector("label").innerHTML;
    optionContainer.classList.remove("active")
    displayQty = option.querySelector("label").innerHTML
    displayData(gamesData);
  })
})

//* sort data from input

function sortData(data, sortBy) {
  let sortedData = data.slice();
  
  if (sortBy === "alphabetical" || sortBy === "release") {
    sortedData.sort((a, b) => {
      const params = sortBy === "alphabetical"
      ? [a.title.localeCompare(b.title), b.title.localeCompare(a.title)]
      : [new Date(a.release_date) - new Date(b.release_date), new Date(b.release_date) - new Date(a.release_date)]
      return sortOrder
        ? params[0]
        : params[1];
    });
    sortOrder = !sortOrder;
  } else if (sortBy === "favorite") {
    return displayData(favorite)
  }
  return sortedData;
}

//* toggle favorite icon and add/remove from array
function toggleFavorite(e) {
  const target = e.target;
  const card = target.parentNode.parentNode.parentNode;
  
  let cardData = {
    thumbnail: card.querySelector('img').src,
    title: card.querySelector('.header').innerText,
    short_description: card.querySelector('.text-overflow').innerText,
    genre: card.querySelector('.badge').innerText,
    index: null
  }

  target.classList.toggle('fas');
  target.classList.toggle('far');
  let fav = favorite.findIndex(obj => obj.title === cardData.title);
  let game = gamesData.findIndex(obj => obj.title === cardData.title);

  if (game !== -1) {
    // If the item exists in the gamesData array, remove it and add it to favorites
    cardData.index = game;
    gamesData.splice(game, 1);
    favorite.push(cardData);
  } else {
    // If the item exists in the favorites array, remove it and add it back to gamesData
    let removed = favorite.splice(fav, 1);
    gamesData.splice(removed[fav].index, 0, ...removed);
  }

  // Call displayData with either gamesData or favorite, depending on the state of the item
  if (fav === -1 ) {
    filter === "undefined" ? displayData(gamesData) : displayData(sortData(gamesData, filter))
  } else {
    displayData(favorite)
  }

}

//* genre Counter
function countGenres(data, id) {
  let count = 0;
  const elm = (id) => {
    document.getElementById(id).querySelector('span').textContent = count;
    count++;
  }
  for (let i = 0; i < (displayQty ||= 30); i++) {
    if (data[i].genre === id) { elm(id) }
    if (data[i].genre === "ARPG") { elm("Action RPG") }
    if (data[i].genre === "MMORAPG") { elm("MMORPG") }
  }
}

//* create the game cards
function createCard(data) {
  if (!data) return '';
  const myFav = favorite.findIndex(fav => fav.title === data.title) >= 0 ? "fas" : "far";
  return `
    <div class="game-card">
      <div class="card-body">
        <div class="img-wrapper">
          <img src="${data.thumbnail}" alt="thumbnail">
        </div>
        <div class="card-content">
          <h3 class="header text-overflow">${data.title}</h3>
          <p class="text-overflow">${data.short_description}</p>
          <div class="card-info">
            <i class="${myFav} fa-heart"></i>
            <div>
              <span class="badge">${data.genre}</span>
              <i class="fab fa-windows"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

//* display the api array via original data/ filtered data
function displayData(data) {
  let output = '';
  
  for (let i = 0; i < (displayQty ||= 30); i++) {
    output += createCard(data[i]);

    for (const legendItem of legendItems) {
      const id = legendItem.getAttribute('id');
      countGenres(gamesData, id)
    }
  }

  document.getElementById('data').innerHTML = output;
  document.getElementById('info').innerHTML = `${data.length} games available in out games list!`;

  const toggleButtons = document.querySelectorAll('.fa-heart');
  toggleButtons.forEach(button => button.addEventListener('click', toggleFavorite));
}