// socket.on
function initSocketIO () {
  socket = io()

  // socket.io listeners
  socket.on('get song', function (data) {
    view.updateList(data)
    view.updatePlaying(data)
    play(data.playing.id)
  })

  socket.on('set song', function (data) {
    view.updatePlaying(data)
    play(data.playing.id)
  })

  socket.on('update list', function (data) {
    view.updateList(data)
  })

  socket.on('update playing', function (data) {
    if (data.playing) {
      view.updatePlaying(data)
      load(data.playing.id)
    }
  })

  socket.on('err', function (data) {
    errorHandler(data)
  })

  socket.on('set volume', function (data) {
    controller.setVolume(data)
  })

  socket.on('pauseplay', function (data) {
    controller.pausePlay(data)
  })

  socket.on('get volume', function (data) {
    controller.setVolume(data)
  })

  socket.on('play', function (data) {
    controller.play(data)
  })

  socket.on('pause', function (data) {
    controller.pause(data)
  })

  socket.on('user count', function (data) {
    console.log(data)
    $('#user-count').text(data)
  })
}

// socket.emit
function plus (id) {
  socket.emit('push queue', {id: id})
}
function removeQueue (id) {
  socket.emit('remove queue', {id: id})
}
function removeHistory (id) {
  socket.emit('remove history', {id: id})
}
function setPlaying (id) {
  socket.emit('set playing', {id: id})
}
function nextSong () {
  socket.emit('next song')
}
function getList () {
  socket.emit('get list')
}
function getPlaying () {
  socket.emit('get playing')
}
function newSong (data) {
  socket.emit('new song', data)
}
function newList (data) {
  socket.emit('new list', data)
}
function setVolume (value) {
  socket.emit('set volume', value)
}
function getVolume (value) {
  socket.emit('get volume', value)
}
function pausePlay (value) {
  socket.emit('pauseplay', value)
}

