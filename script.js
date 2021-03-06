'use strict';

const hikingURL = 'https://www.hikingproject.com/data/get-trails?lat=40.3772&lon=-105.5217&maxDistance=100&maxResults=500&key=200010523-65a91fc7d6ebfbd5ac9a7c58752ca49c';

/* API CALL TO HIKING PROJECT*/
function getHikes() {
  var searchJson = undefined;
  fetch(hikingURL)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })

    .then(responseJson => {
      searchJson = responseJson;
      return displayResults(responseJson);
    })

    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });

  $('form').submit(event => {
    event.preventDefault();
    const searchTerm = $('#js-search-term').val();
    searchResults(searchJson, searchTerm);

    $('#js-form')[0].reset();
  });
}

/*SEARCH BOX RESULTS */
function searchResults(responseJson, searchTerm) {
  const trailSearch = responseJson.trails.filter(trail => {
    return trail.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  $('.results').empty();

  if (trailSearch.length === 0) {
    $('.results').append(`No trail by that name. Please enter new trail name.`)
  }

  for (let i = 0; i < trailSearch.length; i++) {
    const currentTrail = trailSearch[i];

    if (currentTrail.location === "Estes Park, Colorado") {

      $('.results').append(trailData(currentTrail));

      toggleData(currentTrail);
    }
  }
}


/* RESULTS FROM INITIAL API CALL SORTED BY LOCATION OF ESTES PARK */
function displayResults(responseJson, searchTerm) {

  const estesOnlyTrails = responseJson.trails.filter(trail => {
    return trail.location === 'Estes Park, Colorado';
  });

  for (let i = 0; i < estesOnlyTrails.length; i++) {
    const currentTrail = estesOnlyTrails[i];

    if (currentTrail.id === 705646) {
      continue;
    }

    if (currentTrail.location === "Estes Park, Colorado") {

      $('.results').append(trailData(currentTrail))

      toggleData(currentTrail);
    }
  }
}

/* ACCESSING TRAIL INFO */
function trailData(currentTrail) {

  return (`<div class='result-${currentTrail.name}'>
  <div class="group">
 <div class="item">
 <button id="toggle-${currentTrail.id}">
 <h3>${currentTrail.name}</h3></button>
 <div><b>Summary:</b><br> ${currentTrail.summary}</div><br>
 <div><b>Length:</b><br> ${currentTrail.length} miles</div><br>
 
 <div id="content-${currentTrail.id}" class='content'> 
 <div><b>Ascent:</b><br> ${currentTrail.ascent}</div><br>
 <div><b>Altitude:</b><br>
 {currentTrail.high} feet</div><br>
 <div><b>Current Conditions:</b><br> ${currentTrail.conditionStatus}</div><br>
 <b>Youtube Videos:</b><br><br>
</div></div>
 
<div class="item-picture"><img src="${currentTrail.imgMedium}" alt="Trail Picture"></div>
 </div></div>`)

}

/* OPEN TOGGLE FOR TRAIL DATA */
function toggleData(currentTrail) {
  let toggle = document.getElementById(`toggle-${currentTrail.id}`);
  let selectedContent = document.getElementById(`content-${currentTrail.id}`);

  selectedContent.style.display = 'none';

  toggle.addEventListener("click", function (e) {
    for (let j = 0; j < $('.content').length; j++) {
      $('.content')[j].style.display = 'none';
    }

    if (selectedContent.style.display === 'none') {
      selectedContent.style.display = 'block';
      getYouTubeVideos(`${currentTrail.name}, Rocky Mountain National Park`, selectedContent);

    } else {
      selectedContent.style.display = 'none'
    }

  });
}


const apiKey = 'AIzaSyD-wTO-pgN4n-0etXqDG7YjTo5_6UveKps';
const youtubeURL = 'https://www.googleapis.com/youtube/v3/search';

/* FORMATTING YOUTUBE API CALL */
function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
  return queryItems.join('&');
}

/* GET TOP THREE VIDEOS WITH TRAIL NAME AS TITLE */
function youtubeResults(responseJson, content) {
  const youtubeVideo = responseJson.items;

  $('.currentVid').remove();

  let videoContainer = $(`<div class='videoContainer'></div>`);

  for (let i = 0; i < youtubeVideo.length; i++) {
    $(videoContainer).append(`<br>
      <div class='currentVid'>
       <a href='https://www.youtube.com/watch?v=${youtubeVideo[i].id.videoId}', target="_blank"><img src='${youtubeVideo[i].snippet.thumbnails.default.url}'></a><br>
    </div></div>`);
  };

  $(content).append(videoContainer)

};

/* SEARCH FOR YOUTUBE VIDEO WHEN TRAIL NAME IS CLICKED */
function getYouTubeVideos(query, content) {
  const params = {
    key: apiKey,
    q: query,
    part: 'snippet, id',
    maxResults: 3,
    type: 'video'
  };
  const queryString = formatQueryParams(params)
  const url = youtubeURL + '?' + queryString;

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => youtubeResults(responseJson, content))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

$(getHikes)
