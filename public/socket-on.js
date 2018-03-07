function setSocketListeners () {
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
}
