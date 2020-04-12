const YoutubeVideoFetcher = require('./fetcher.js')
const FakePlayer = require('./fakeplayer.js')

function debug(...err) {
  if (process.env.DEBUG) {
    console.log(...err)
  }
}

class Playlist {
  constructor (dispatcher, config, mode) {
    this.queue = []
    this.history = []
    this.playing = null
    this.volume = 50

    this.dispatcher = dispatcher
    this.mode = mode
    this.fetcher = new YoutubeVideoFetcher(config)

    // Default song
    this.japari = {
      id: 'xkMdLcB_vNU',
      title: 'TVアニメ『けものフレンズ』主題歌「ようこそジャパリパークへ / どうぶつビスケッツ×PPP」',
      url: 'https://youtu.be/xkMdLcB_vNU',
      duration: 'PT1M33S'
    }
    // this.queue.push(song_data)
    if (mode == 'service') {
      this.fakeplayer = new FakePlayer(this)
      this.nextSong()
    }
  }

  newSong (song_data) {
    var id = song_data.id;

    var in_queue = this.queue.find(function (d) { return d.id === id })
    var in_history = this.history.find(function (d) { return d.id === id })

    // playing is not empty -> playing.id !== id -> false
    // playing is empty -> false
    var in_playing = !(this.playing !== null || (this.playing.id !== id))
    debug('[debug] Check if new song already exist')
    debug('[debug] In queue? ' + in_queue)
    debug('[debug] In history? ' + in_history)
    debug('[debug] In playing? ' + in_playing)

    if (in_queue || in_history || in_playing) {
      throw {code: 1, msg: 'song already in playlist!'}
    } else {
      this.queue.push(song_data)
      debug('[debug] Songs in queue after pushing')
      debug(this.queue)
      this.dispatcher.updateList({queue: this.queue, history: this.history})
    }
  }

  newList (songList) {
    for (const song of songList) {
      this.newSong(song)
    }
  }

  async newSongByYoutubeId (id) {
    console.log('[info]  New song: ' + id)
    var song_data = await this.fetcher.fetchVideo(id)
    this.newSong(song_data)
  }

  async newListByYoutubeId (id) {
    console.log('[info]  New list: ' + id)
    var songList = await this.fetcher.fetchList(id)
    this.newList(songList)
  }

  // Read
  getQueue () {
    console.log('[info]  Get Queue')
    return this.queue
  }

  getHistory () {
    console.log('[info]  Get History')
    return this.history
  }

  getPlaying () {
    console.log('[info]  Get Playing: ' + this.playing)
    return this.playing
  }

  getVolume () {
    console.log('[info]  Get volumn: ' + this.volume)
    return this.volume
  }

  // Socket update
  updateList (socket) {
    console.log('[info]  Update list!')
    this.dispatcher.updateListSocket(socket, {queue: this.queue, history: this.history})
  }

  updatePlaying (socket) {
    console.log('[info]  Update playing!')
    this.dispatcher.updatePlayingSocket(socket, {playing: this.playing})
  }

  // Global update
  nextSong () {
    console.log('[info]  Next song!')
    var song_data = null

    if (this.queue.length) {
      song_data = this.queue.shift()
    } else if (this.history.length) {
      song_data = this.history.splice(Math.floor(Math.random() * this.history.length), 1)[0]
    } else if (this.playing) {
      song_data = this.playing
    } else {
      console.log('[info]  No thing in the list! Play japari park!')
      song_data = this.japari
    }

    if (this.playing && this.playing !== song_data) { this.history.push(this.playing) }
    this.playing = song_data

    if (this.mode == 'service') { this.fakeplayer.play(this.playing) }

    this.dispatcher.getSong({playing: this.playing, queue: this.queue, history: this.history})
    return song_data
  }

  setSong (id) {
    console.log('[info]  Set song: ' + id)
    if (this.playing) this.history.push(this.playing)
    var song_data
    this.queue = this.queue.filter(function (d) {
      if (d.id !== id) return true
      else {
        song_data = d
        return false
      }
    })
    this.playing = song_data
    this.dispatcher.getSong({playing: this.playing, queue: this.queue, history: this.history})
    return song_data
  }

  pushQueue (id) {
    console.log('[info]  Push song to queue: ' + id)
    var index = this.history.map(function (d) { return d.id }).indexOf(id)
    var song_data = this.history.splice(index, 1)[0]
    this.queue.push(song_data)
    this.dispatcher.updateList({queue: this.queue, history: this.history})
    return song_data
  }

  // Control
  setVolume (val) {
    console.log('[info]  Set volume: ' + val)
    this.volume = val
    this.dispatcher.setVolume(this.volume)
  }

  pausePlay () {
    console.log('[info]  Pause/Play')
    if (this.mode == 'station') { this.dispatcher.pausePlay() }
    else if (this.mode == 'service') { this.fakeplayer.pausePlay() }
  }

  play () {
    console.log('[info]  Play')
    if(!this.playing) {
      this.nextSong()
    } else {
      this.dispatcher.play()
      if (this.mode == 'service') { this.fakeplayer.resume() }
    }
  }

  pause () {
    console.log('[info]  Pause')
    this.dispatcher.pause()
    if (this.mode == 'service') { this.fakeplayer.pause() }
  }

  // Delete
  removeQueue (id) {
    console.log('[info]  Del queue: ' + id)
    var poped
    this.queue = this.queue.filter(function (d) {
      if (d.id !== id) return true
      else {
        poped = d
        return false
      }
    })
    this.dispatcher.updateList({playing: this.playing, queue: this.queue, history: this.history})
    return poped
  }

  removeHistory (id) {
    console.log('[info]  Del history: ' + id)
    var poped
    this.history = this.history.filter(function (d) {
      if (d.id !== id) return true
      else {
        poped = d
        return false
      }
    })
    this.dispatcher.updateList({playing: this.playing, queue: this.queue, history: this.history})
    return poped
  }
}

module.exports = Playlist
