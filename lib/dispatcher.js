class Dispatcher {
  constructor (io) {
    this.io = io
  }

  play () {
    this.io.emit('play')
  }

  pause () {
    this.io.emit('pause')
  }

  pausePlay () {
    this.io.emit('pauseplay')
  }

  updateList (list) {
    this.io.emit('update list', list)
  }

  updatePlaying (playing) {
    this.io.emit('update playing', playing)
  }

  updateListSocket (socket, list) {
    socket.emit('update list', list)
  }

  updatePlayingSocket (socket, playing) {
    socket.emit('update playing', playing)
  }

  getSong (list) {
    this.io.emit('get song', list)
  }

  setVolume (volume) {
    this.io.emit('set volume', volume)
  }
}

module.exports = Dispatcher
