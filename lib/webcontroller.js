class WebController {
  constructor (playlist, io) {
    this.io = io
    this.playlist = playlist
    this.userCnt = 0
  }

  connectionHandler () {
    var self = this
    return function (socket) {
      self.userCnt++;
      console.log("[info]  A new user connected!")
      self.io.emit('user count', self.userCnt)

      // Disconnect
      socket.on('disconnect', () => {
        self.userCnt--;
        console.log("[info]  A user disconnected.")
        self.io.emit('user count', self.userCnt)
      });

      // Create
      socket.on('new song', function (data) {
        var id = data.id
        self.playlist.newSongByYoutubeId(id).catch((err) => {
          socket.emit('err', err)
        })
      })

      socket.on('new list', function (data) {
        var id = data.id
        self.playlist.newListByYoutubeId(id).catch((err) => {
          socket.emit('err', err)
        })
      })

      // Read
      socket.on('get list', function (data) {
        self.playlist.updateList(socket)
      })

      socket.on('get playing', function (data) {
        self.playlist.updatePlaying(socket)
      })

      // Control
      socket.on('next song', function (data) {
        self.playlist.nextSong()
      })

      // TODO: modify get volume
      socket.on('get volume', function () {
        var volume = self.playlist.getVolume()
        socket.emit('get volume', volume)
      })

      // Update
      socket.on('push queue', function (data) {
        var id = data.id
        self.playlist.pushQueue(id)
      })

      socket.on('set volume', function (value) {
        self.playlist.setVolume(value)
      })

      socket.on('set playing', function (data) {
        var id = data.id
        self.playlist.setSong(id)
      })

      // Delete
      socket.on('remove queue', function (data) {
        var id = data.id
        self.playlist.removeQueue(id)
      })

      socket.on('remove history', function (data) {
        var id = data.id
        self.playlist.removeHistory(id)
      })

      // Player Control
      socket.on('pauseplay', function () {
        self.playlist.pausePlay()
      })
    }
  }
}

module.exports = WebController
