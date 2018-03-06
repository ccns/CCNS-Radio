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
  // next () {
  //   this.io.emit('next')
  // }
  updateList (list) {
    this.io.emit('update list', list)
  }
  getSong (list) {
    this.io.emit('get song', list)
  }
  setVolume (volume) {
    this.io.emit('set volume', volume)
  }
  // setSong (playing) {
  //   this.io.emit('set song', playing)
  // }
}

module.exports = Dispatcher
