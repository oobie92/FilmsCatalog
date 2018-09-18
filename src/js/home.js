// const getUser = new Promise(function (ok, err) {
//   setTimeout(() => ok('this is an test 1'), 3000)
// })

// const getUser2 = new Promise(function (ok, err) {
//   setTimeout(function () {
//     ok('this is an test 2, Yeah!')
//   }, 5000)
// })

// Promise.race([
//   getUser,
//   getUser2
// ])
//   .then(msg => console.log(msg))
//   .catch(msg => console.log(msg))


// $.ajax('https://randomuser.me/api/g7hg7gh7g7', {
//   method: "GET",
//   success: function (response) {
//     console.log(response)
//   },
//   error: function (err) { console.log(err) }
// });


// fetch('https://randomuser.me/api/f45dg45f')
//   .then(res => res.json() )
//   .then(user => console.log(user.results[0]))
//   .catch(err => console.log(err))

// fetch('https://api.themoviedb.org/3/genre/movie/list?api_key=f591384525ed7fbae937437e817884d1')
// .then(res => res.json())
// .then(res => console.log(res))

// const apiKey = 'f591384525ed7fbae937437e817884d1'
//const url = `https://api.themoviedb.org/3/movie/18/lists?api_key=${apiKey}&language=en-US`
// const url = `https://yts.am/api/v2/list_movies.json`

(async function load() {
  // await
  // action
  // terror
  // animation
  async function getData(url) {
    const response = await fetch(url);
    const data = await response.json()
    if ( data.data.movie_count > 0 ) {
      return data;
    }

    throw new Error('No se encontró ningun resultado')
  }
  const $form = document.getElementById('form')
  const $home = document.getElementById('home')
  const $featuringContainer = document.getElementById('featuring')

  function setAttributes($element, attributes){
    for (const attribute in attributes) {
      $element.setAttribute(attribute, attributes[attribute])
    }
  }

  const BASE_API = 'https://yts.am/api/v2/list_movies.json?'

  function featuringTemplate(movie){
    return (
      `
      <div class="featuring">
        <div class="featuring-image">
          <img src="${movie.medium_cover_image}" width="70" height="100" alt="">
        </div>
        <div class="featuring-content">
          <p class="featuring-title">Found!</p>
          <p class="featuring-album">${movie.title}</p>
        </div>
      </div>
      `
    )
  }

  $form.addEventListener('submit', async (event) => {
    event.preventDefault()
    $home.classList.add('search-active')
    const $loader = document.createElement('img')
    setAttributes($loader, {
      src: 'src/images/loader.gif',
      height: 50,
      width: 50
    })
    $featuringContainer.append($loader)

    const data = new FormData($form)
    try {
      const {
        data: {
          movies
        }
      } = await getData(`${BASE_API}limit=1&query_term=${data.get('name')}`)
      const HTMLString = featuringTemplate(movies[0])
      $featuringContainer.innerHTML = HTMLString
    } catch(err) {
      alert(err.message)
      $loader.remove()
      $home.classList.remove('search-active')
    }
  })

  

  // console.log(actionList, dramaList, animationList)
  function videoItemTemplate(movie, category) {
    return (
      `<div class="primaryPlaylistItem" data-id="${movie.id}" data-category="${category}">
        <div class="primaryPlaylistItem-image">
          <img src="${movie.medium_cover_image}">
        </div>
        <h4 class="primaryPlaylistItem-title">
          ${movie.title}
        </h4>
      </div>`
    )
  }

  function createTemplate(HTMLString) {
    const html = document.implementation.createHTMLDocument()
    html.body.innerHTML = HTMLString
    return html.body.children[0]
  }
  
  function addEventClick($element){
    $element.addEventListener('click', () => {
      showModal($element)
    })
  }

  function renderMovieList(lists, $containers, categories){
    
    for (let index = 0; index < lists.length; index++) {
      const list = lists[index]
      const $container = $containers[index]
      const category = categories[index]
      // debugger
      if ($container.children[0]) $container.children[0].remove();
      
      list.forEach((movie) => {
        const HTMLString = videoItemTemplate(movie, category);
        const movieElement = createTemplate(HTMLString)
        $container.append(movieElement)
        const image = movieElement.querySelector('img')
        image.addEventListener('load', (event) => {
          event.srcElement.classList.add('fadeIn')
        })
        addEventClick(movieElement)
        // console.log(HTMLString);
      })
    }
  }

  async function cacheExist(category) {
    const listName = `${category}List`
    const cacheList = window.localStorage.getItem(listName)
    if (cacheList){
      return JSON.parse(cacheList)
    }

    const { data: { movies: data } } = await getData(`${BASE_API}genre=${category}`) 
    window.localStorage.setItem(listName, JSON.stringify(data))

    return data
  }

  // const { data: { movies: actionList } } = await getData(`${BASE_API}genre=action`)
  const actionList = await cacheExist('action')
  const dramaList = await cacheExist('drama')
  const animationList = await cacheExist('animation')
  
  const $actionContainer = document.querySelector('#action');
  const $dramaContainer = document.getElementById('drama');
  const $animationContainer = document.getElementById('animation');
  const arrayLists = [actionList, dramaList, animationList]
  const $arrayContainers = [$actionContainer, $dramaContainer, $animationContainer]
  const category = ['action', 'drama', 'animation']

  renderMovieList(arrayLists, $arrayContainers, category)

  // const $home = $('.home .list #item');
  const $modal = document.getElementById('modal');
  const $overlay = document.getElementById('overlay');
  const $hideModal = document.getElementById('hide-modal');

  const $modalTitle = $modal.querySelector('h1');
  const $modalImage = $modal.querySelector('img');
  const $modalDescription = $modal.querySelector('p');

  function findById(list, id) {
    return list.find(movie => movie.id === parseInt(id, 10))
  }

  function findMovie(id, category) {
    switch(category){
      case 'action': {
        return findById(actionList, id)
      }
      case 'drama': {
        return findById(dramaList, id)
      }
      default: {
        return findById(animationList, id)
      }
    }
  }

  function showModal($element) {
    $overlay.classList.add('active')
    $modal.style.animation = 'modalIn .8s forwards'
    const id = $element.dataset.id
    const category = $element.dataset.category
    const data = findMovie(id, category)

    $modalTitle.textContent = data.title
    $modalImage.setAttribute('src', data.medium_cover_image)  
    $modalDescription.textContent = data.description_full
  }

  $hideModal.addEventListener('click', hideModal)

  function hideModal() {
    $overlay.classList.remove('active')
    $modal.style.animation = 'modalOut .9s forwards'
  }



})()