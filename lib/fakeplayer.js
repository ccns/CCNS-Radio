const {parse, toSeconds} = require('iso8601-duration');

class FakePlayer {
  constructor (playlist) {
    this.playlist = playlist
    this.start = 0
    this.timeoutId = null
    this.remaining = 0
    this.song_data = null
  }

  play (song_data) {
    if(this.timeoutId !== null) { this.pause() }
    console.log("[fake]  Playing " + song_data.id)
    this.remaining = toSeconds(parse(song_data.duration)) * 1000
    this.song_data = song_data
    this.resume()
  }

  resume () {
    console.log("[fake]  Resume " + this.song_data.id)
    this.start = Date.now()
    this.timeoutId = setTimeout(() => {
      this.song_data = null
      this.timeoutId = null
      this.playlist.nextSong()
    }, this.remaining);
  }

  pause () {
    console.log("[fake]  Pause " + this.song_data.id)
    clearTimeout(this.timeoutId)
    this.remaining -= Date.now() - this.start
    this.timeoutId = null
  }

  pausePlay () {
    if (this.timeoutId) {
      this.pause()
    } else {
      this.resume()
    }
  }

  isPlaying () {
    return this.song_data != null
  }

  getProgress () {
    return remaining
  }
}

module.exports = FakePlayer
