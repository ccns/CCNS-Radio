class WebController {
  constructor (playlist) {
    this.playlist = playlist
  }

  connectionHandler (socket) {
    // Create
    socket.on('new song', function (data) {
      var id = data.id
      playlist.newSong(id, function (err) {
        socket.emit('err', err)
      })
    })
    socket.on('new list', function (data) {
      var id = data.id
      playlist.newList(id, function (list) {
        io.emit('update list', list)
      }, function (err) {
        socket.emit('err', err)
      })
    })

    // Read
    socket.on('get list', function (data) {
      var queue = playlist.getQueue()
      var history = playlist.getHistory()
      io.emit('update list', {queue: queue, history: history})
    })
    socket.on('get playing', function (data) {
      var playing = playlist.getPlaying()
      socket.emit('update playing', {playing: playing})
    })
    socket.on('next song', function (data) {
      var list = playlist.nextSong()
      io.emit('get song', list)
    })
    socket.on('get volume', function () {
      var volume = playlist.getVolume()
      socket.emit('get volume', volume)
    })

    // Update
    socket.on('push queue', function (data) {
      var id = data.id
      var list = playlist.pushQueue(id)
      io.emit('update list', list)
    })
    socket.on('set volume', function (value) {
      var volume = playlist.setVolume(value)
      io.emit('set volume', volume)
    })
    socket.on('set playing', function (data) {
      var id = data.id
      var playing = playlist.setSong(id)
      var list = playlist.removeQueue(id)
      io.emit('update list', list)
      io.emit('set song', playing)
    })

    // Delete
    socket.on('remove queue', function (data) {
      var id = data.id
      var list = playlist.removeQueue(id)
      io.emit('update list', list)
    })
    socket.on('remove history', function (data) {
      var id = data.id
      var list = playlist.removeHistory(id)
      io.emit('update list', list)
    })

    // Player Control
    socket.on('pauseplay', function () {
      io.emit('pauseplay')
    })
  }
}

module.exports = WebController
