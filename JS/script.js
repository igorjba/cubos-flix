const moviesContainer = document.querySelector(".movies-container");
const moviesSlide = document.querySelector(".movies")
const header = document.querySelector(".header")
const allCardMovies = document.querySelectorAll('.movie')
const previewSlideButton = document.querySelector('.btn-prev')
const nextSlideButton = document.querySelector('.btn-next')

const searchMovieInput = document.querySelector('.input')

const divMovieOfTheDay = document.querySelector('.highlight__video')
const h3TitleMovieOfTheDay = document.querySelector('.highlight__title')
const spanRatingMovieOfTheDay = document.querySelector('.highlight__rating')
const spanGenresMovieOfTheDay = document.querySelector('.highlight__genres')
const spanLaunchMovieOfTheDay = document.querySelector('.highlight__launch')
const pDescriptionMovieOfTheDay = document.querySelector('.highlight__description')
const aVideoLinkMovieOfTheDay = document.querySelector('.highlight__video-link')

const modal = document.querySelector('.modal')
const modalMovieTitle = document.querySelector('.modal__title')
const modalMovieImage = document.querySelector('.modal__img')
const modalMovieDescription = document.querySelector('.modal__description')
const modalMovieAverage = document.querySelector('.modal__average')
const modalMovieGenres = document.querySelector('.modal__genres')
const modalClose = document.querySelector('.modal__close')

const themeButton = document.querySelector('.btn-theme')
const root = document.querySelector(':root')
const logo = document.querySelector('.header__container-logo img')

let movieIdStored = 0
function createMovieCardOnSlides(posterPath, movieTitle, movieVoteAverage, movieId) {
  const divMovie = document.createElement("div")
  divMovie.classList.add('movie')
  divMovie.style.backgroundImage = `url(${posterPath})`
  divMovie.title = `${movieTitle}`

  const divMovieInfo = document.createElement("div")
  divMovieInfo.classList.add('movie__info')

  const spanMovieTitle = document.createElement('span')
  spanMovieTitle.classList.add('movie__title')
  spanMovieTitle.textContent = `${movieTitle}`

  const spanMovieRating = document.createElement('span')
  spanMovieRating.classList.add('movie__rating')
  spanMovieRating.textContent = `${movieVoteAverage}`

  const imageMovie = document.createElement('img')
  imageMovie.classList.add('movie__image')
  imageMovie.src = "./assets/estrela.svg"
  imageMovie.alt = "Star"

  moviesSlide.appendChild(divMovie)
  divMovie.appendChild(divMovieInfo)
  divMovieInfo.appendChild(spanMovieTitle)
  divMovieInfo.appendChild(spanMovieRating)
  spanMovieRating.appendChild(imageMovie)

  divMovie.addEventListener("click", () => {
    movieIdStored = movieId
    modalMovie()
    modal.classList.toggle('hidden')
  })
}

let moviesDiscoverData
async function loadDiscover() {
  try {
    const discoverResponse = await api.get('/discover/movie?language=pt-BR&include_adult=false');
    const apiMovies = discoverResponse.data.results;

    moviesDiscoverData = apiMovies.filter(movie => movie.poster_path && movie.title && movie.vote_average)
      .map(movie => ({ poster_path: movie.poster_path, title: movie.title, vote_average: movie.vote_average, id: movie.id }))
      .slice(0, 18);
  } catch (error) {
  }
}
loadDiscover().then(() => { showMovieOnTheSlider(moviesDiscoverData, currentPage) })

function streamlineMovieListDetails(movies) {
  clear(moviesSlide)
  movies.forEach(movie => {
    const { poster_path, title, vote_average, id } = movie;
    createMovieCardOnSlides(poster_path, title, vote_average, id);
  });
}

let currentPage = 1
let firstSixMovies
let secondSixMovies
let thirdSixMovies
function showMovieOnTheSlider(moviesData, page = 1) {
  firstSixMovies = moviesData.slice(0, 6);
  secondSixMovies = moviesData.slice(6, 12);
  thirdSixMovies = moviesData.slice(12, 18);

  if (page === 1) {
    streamlineMovieListDetails(firstSixMovies);
  } else if (page === 2) {
    streamlineMovieListDetails(secondSixMovies);
  } else if (page === 3) {
    streamlineMovieListDetails(thirdSixMovies);
  }
}

async function movieOfTheDay() {
  try {
    const movieResponse = await api.get(`/movie/436969?language=pt-BR`)
    let moviesOfTheDay = movieResponse.data

    const videoResponse = await api.get(`/movie/436969/videos?language=pt-BR`)
    let videosOfTheDay = videoResponse.data.results

    createMovieOfTheDay(moviesOfTheDay.backdrop_path, moviesOfTheDay.title, moviesOfTheDay.vote_average, moviesOfTheDay.genres, moviesOfTheDay.release_date, moviesOfTheDay.overview, `https://www.youtube.com/watch?v=${videosOfTheDay[0].key}`)

  } catch (error) {

  }
}
movieOfTheDay()

function createMovieOfTheDay(backdrop_path, title, vote_average, genres, release_date, overview, videoLink) {
  divMovieOfTheDay.style.backgroundImage = `url(${backdrop_path})`
  h3TitleMovieOfTheDay.textContent = title
  spanRatingMovieOfTheDay.textContent = vote_average

  let genre = []
  for (let type of genres) {
    genre.push(type.name)
  }

  spanGenresMovieOfTheDay.textContent = genre.join(", ")
  pDescriptionMovieOfTheDay.textContent = overview
  aVideoLinkMovieOfTheDay.href = videoLink
  spanLaunchMovieOfTheDay.textContent = new Date(release_date).toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

previewSlideButton.addEventListener("click", (event) => {
  event.stopPropagation()
  event.preventDefault()
  clear(moviesSlide)
  clearErrorMessageOnSlider()

  if (searchMovieInput.value === '') {
    goToPreviousPage(moviesDiscoverData)

  } else if (!searchMovieInput.value === '' && moviesSearchedData.length < 6) {
    goToPreviousPage(moviesDiscoverData)

  } else if (moviesSearchedData.length === 6) {
    clear(moviesSlide)
    searchMovie(searchMovieInput.value)

  } else if (moviesSearchedData.length === 0) {
    searchMovieInput.value = ''
    loadDiscover().then(() => { showMovieOnTheSlider(moviesDiscoverData) })

  } else {
    goToPreviousPage(moviesSearchedData)
  }

  function goToPreviousPage(movieList) {
    if (currentPage === 1 && movieList.length < 12 && movieList.length > 6) {
      currentPage = 2
      clear(moviesSlide)
      showMovieOnTheSlider(movieList, currentPage)

    } else if (currentPage === 1 && movieList.length < 7) {
      currentPage = 1
      clear(moviesSlide)
      showMovieOnTheSlider(movieList, currentPage)

    } else if (currentPage === 1) {
      currentPage = 3
      clear(moviesSlide)
      showMovieOnTheSlider(movieList, currentPage)

    } else {
      currentPage -= 1
      clear(moviesSlide)
      showMovieOnTheSlider(movieList, currentPage)
    }
  }
})

nextSlideButton.addEventListener("click", (event) => {
  event.stopPropagation()
  event.preventDefault()
  clear(moviesSlide)
  clearErrorMessageOnSlider()

  if (searchMovieInput.value === '') {
    goToNextPage(moviesDiscoverData)

  } else if (!searchMovieInput.value === '' && moviesSearchedData.length < 6) {
    goToNextPage(moviesDiscoverData)

  } else if (moviesSearchedData.length === 6) {
    searchMovie(searchMovieInput.value)

  } else if (moviesSearchedData.length === 0) {
    searchMovieInput.value = ''
    loadDiscover().then(() => { showMovieOnTheSlider(moviesDiscoverData) })

  }
  else {
    goToNextPage(moviesSearchedData)
  }

  function goToNextPage(movieList) {
    clear(moviesSlide)

    if (currentPage === 2 && movieList.length < 12) {
      currentPage = 1
      showMovieOnTheSlider(movieList, currentPage)

    } else if (currentPage === 1 && movieList.length < 7) {
      currentPage = 1
      showMovieOnTheSlider(movieList, currentPage)

    } else if (currentPage === 3) {
      currentPage = 1
      showMovieOnTheSlider(movieList, currentPage)

    } else {
      currentPage += 1
      showMovieOnTheSlider(movieList, currentPage)
    }
  }
})

let moviesSearchedData
async function searchMovie(movieSearched) {
  try {
    const searchResponse = await api.get(`/search/movie?language=pt-BR&include_adult=false&query=${movieSearched}`)
    let movieSelected = searchResponse.data.results

    moviesSearchedData = movieSelected.filter(movie => movie.poster_path && movie.title && movie.vote_average)
      .map(movie => ({ poster_path: movie.poster_path, title: movie.title, vote_average: movie.vote_average, id: movie.id }));
    clear(moviesSlide)

    if (moviesSearchedData.length === 0) {
      showErrorMessageOnSlider()

    } else {
      showMovieOnTheSlider(moviesSearchedData, currentPage)
    }
  } catch (error) {
  }
}

searchMovieInput.addEventListener("keyup", (event) => {
  event.stopPropagation()
  event.preventDefault()
  clear(moviesSlide)
  clearErrorMessageOnSlider()
  currentPage = 1
  if (searchMovieInput.value === " ") {
    searchMovieInput.value = ''
    loadDiscover().then(() => { showMovieOnTheSlider(moviesDiscoverData) })

  } else if (!searchMovieInput.value) {
    searchMovieInput.value = ''
    loadDiscover().then(() => { showMovieOnTheSlider(moviesDiscoverData) })

  } else if (event.key === 'Enter' && event.key) {
    searchMovieInput.value = ''
    loadDiscover().then(() => { showMovieOnTheSlider(moviesDiscoverData) })

  } else if (event.key === 'Enter') {
    currentPage = 1
    searchMovieInput.value = ''
    loadDiscover().then(() => { showMovieOnTheSlider(moviesDiscoverData) })

  }
  else {
    searchMovie(searchMovieInput.value)
  }
})

function showErrorMessageOnSlider() {
  moviesSlide.style.backgroundImage = `url(./assets/error-img.svg)`
  moviesSlide.style.backgroundSize = 'cover'
  moviesSlide.style.width = '40%'
  moviesSlide.style.height = '100%'
}

function clearErrorMessageOnSlider() {
  moviesSlide.style.backgroundImage = ''
  moviesSlide.style.backgroundSize = ''
  moviesSlide.style.width = ''
  moviesSlide.style.height = ''
}

function clear(param) {
  param.innerHTML = ""
}

async function modalMovie() {
  try {
    let modalResponse = await api.get(`/movie/${movieIdStored}?language=pt-BR`)
    let modalMovieResponse = modalResponse.data
    fillModal(modalMovieResponse.title, modalMovieResponse.backdrop_path, modalMovieResponse.overview, modalMovieResponse.vote_average, modalMovieResponse.genres)

  } catch (error) {
  }
}

function fillModal(title, backdrop_path, overview, vote_average, genres) {
  modalMovieTitle.textContent = title
  modalMovieAverage.textContent = vote_average.toFixed(1)

  if (!backdrop_path || backdrop_path == null && !overview || overview == "") {
    modalMovieDescription.style.fontWeight = "bold"
    modalMovieDescription.textContent = "A descrição e a capa do filme não foram encontradas."

  } else if (!backdrop_path || backdrop_path == null) {
    modalMovieDescription.style.fontWeight = "bold"
    modalMovieDescription.textContent = "A capa do filme não foi encontrada."
    modalMovieDescription.textContent = overview

  } else if (!overview || overview == "") {
    modalMovieDescription.style.fontWeight = "bold"
    modalMovieDescription.textContent = "A descrição do filme não foi encontrada."
    modalMovieDescription.style.tex = "uppercase"
    modalMovieImage.src = backdrop_path

  } else {
    modalMovieDescription.textContent = overview
    modalMovieImage.src = backdrop_path

  }
  let modalGenre = []
  for (let type of genres) {
    modalGenre.push(type.name)

  }
  createModalGenre(modalGenre.join(" | "))
}

function modalHidden() {
  modal.addEventListener('click', () => {
    modal.classList.toggle('hidden')
    modalMovieTitle.textContent = ''
    modalMovieImage.src = ''
    modalMovieDescription.style.fontWeight = "normal"
    modalMovieDescription.textContent = ''
    modalMovieAverage.textContent = ''
  })
} modalHidden()

function createModalGenre(genreName) {
  clear(modalMovieGenres)

  const modalMovieGenre = document.createElement("div")
  modalMovieGenre.classList.add('modal__genre')
  modalMovieGenre.textContent = genreName

  modalMovieGenres.appendChild(modalMovieGenre)
}

function applyCurrentTheme() {
  const currentTheme = localStorage.getItem('theme')

  if (!currentTheme || currentTheme === 'light') {
    themeButton.src = './assets/light-mode.svg'

    previewSlideButton.src = './assets/arrow-left-dark.svg'
    nextSlideButton.src = './assets/arrow-right-dark.svg'

    logo.src = './assets/logo-dark.png'

    modalClose.src = './assets/close-dark.svg'

    root.style.setProperty('--background', '#fff')
    root.style.setProperty('--input-color', '#1B2028')
    root.style.setProperty('--bg-input-color', '#fff')
    root.style.setProperty('--text-color', '#1b2028')
    root.style.setProperty('--input-text-color', '#1B2028')
    root.style.setProperty('--bg-secondary', '#ededed')
    return
  }
  themeButton.src = './assets/dark-mode.svg'

  previewSlideButton.src = './assets/arrow-left-light.svg'
  nextSlideButton.src = './assets/arrow-right-light.svg'

  logo.src = './assets/logo.svg'

  modalClose.src = './assets/close.svg'

  root.style.setProperty('--background', '#1B2028')
  root.style.setProperty('--background', '#1B2028')
  root.style.setProperty('--input-color', '#665F5F')
  root.style.setProperty('--bg-input-color', '#3E434D')
  root.style.setProperty('--text-color', '#fff')
  root.style.setProperty('--input-text-color', '#fff')
  root.style.setProperty('--bg-secondary', '#2D3440')
}
applyCurrentTheme()

themeButton.addEventListener('click', (event) => {
  event.stopPropagation()
  event.preventDefault()
  const currentTheme = localStorage.getItem('theme')

  if (!currentTheme || currentTheme === 'light') {
    localStorage.setItem('theme', 'dark')
    applyCurrentTheme()
    return
  }
  localStorage.setItem('theme', 'light')
  applyCurrentTheme()
})