
const api = 'https://free-to-play-games-database.p.rapidapi.com/api/games';

const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': '554bdbcf7fmshad8fab0cfbcf624p196aa5jsn5bc4c284f1f7',
		'X-RapidAPI-Host': 'free-to-play-games-database.p.rapidapi.com'
	}
};

fetch(api, options)
	.then(response => response.json())
	.then(data => {
    let output = '';
    for (let i = 0; i < 30; i++) {
      console.log(data[i]);
      output += `
      <div class="game-card">
        <div class="card-body">
          <div class="img-wrapper">
            <img src="${data[i].thumbnail}" alt="thumbnail">
          </div>
          <div class="card-content">
            <h3 class="header text-overflow">${data[i].title}</h3>
            <p class="text-overflow">${data[i].short_description}</p>
            <div class="card-info">
              <i class="far fa-heart"></i>
              <div>
                <span class="badge">${data[i].genre}</span>
                <i class="fab fa-windows"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      `;
    }
    document.getElementById('data').innerHTML = output;
  })
	.catch(err => console.error(err));

