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

  pauseplay () {
    this.io.emit('pauseplay')
  }

  updateList (list) {
    this.io.emit('update list', list)
  }

  getSong (list) {
    this.io.emit('get song', list)
  }

  setVolume (volume) {
    this.io.emit('set volume', volume)
  }
}

module.exports = Dispatcher
