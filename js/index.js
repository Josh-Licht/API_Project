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

const active = 'active';
const dataFilter = '[data-filter]';

//* filtering variables
const filterLink = document.querySelectorAll(dataFilter);
const searchBox = document.querySelector('#search');
const gameItems = document.querySelectorAll(dataFilter);

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
    const filter = this.dataset.filter;
    if (filter === "all") {
      return displayData(gamesData);
    } else if (filter === "favorite") {
      return displayData(favorite);
    }
    return  displayData(sortData(gamesData, filter));
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
  
  if (sortBy === "alphabetical") {
    sortedData.sort((a, b) => {
      return sortOrder
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    });
    sortOrder = !sortOrder;
  } else if (sortBy === "release") {
    sortedData.sort((a, b) => {
      return sortOrder
        ? new Date(a.release_date) - new Date(b.release_date)
        : new Date(b.release_date) - new Date(a.release_date);
    });
    sortOrder = !sortOrder;
  }else if (sortBy === "favorite") {
    return displayData(favorite)
  }
  return sortedData;
}

//* toggle favorite icon and add/remove from array
function toggleFavorite(e) {
  const target = e.target;
  const card = target.parentNode.parentNode.parentNode;

  let gameData = {
    thumbnail: card.querySelector('img').src,
    title: card.querySelector('.header').innerText,
    short_description: card.querySelector('.text-overflow').innerText,
    genre: card.querySelector('.badge').innerText
  }

  target.classList.toggle('fas');
  target.classList.toggle('far');
  let index = favorite.findIndex(obj => obj.title === gameData.title);

  if(index >= 0) {
    favorite.splice(index, 1)
  } else {
    favorite.push(gameData);
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
  }
  document.getElementById('data').innerHTML = output;
  document.getElementById('info').innerHTML = `${data.length} games available in out games list!`;

  const toggleButtons = document.querySelectorAll('.fa-heart');
  toggleButtons.forEach(button => button.addEventListener('click', toggleFavorite));
}