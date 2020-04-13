const YoutubeVideoFetcher = require('./fetcher.js')
const FakePlayer = require('./fakeplayer.js')
const {LocalList} = require('./listmodel.js')

function debug(...err) {
  if (process.env.DEBUG) {
    console.log(...err)
  }
}

class Playlist {
  constructor (dispatcher, config, mode) {
    this.list = new LocalList()
    this.playing = null
    this.volume = 50

    this.dispatcher = dispatcher
    this.mode = mode
    this.fetcher = new YoutubeVideoFetcher(config)

    if (mode == 'service') {
      this.fakeplayer = new FakePlayer(this)
      this.nextSong()
    }
  }

  newSong (song_data) {
    var id = song_data.id;

    var in_queue = this.list.searchQueue(id) !== undefined
    var in_history = this.list.searchHistory(id) !== undefined

    // playing is not empty -> playing.id !== id -> false
    // playing is empty -> false
    var in_playing = !(this.playing === null || (this.playing.id !== id))
    debug('[debug] Check if new song already exist')
    debug('[debug] In queue? ' + in_queue)
    debug('[debug] In history? ' + in_history)
    debug('[debug] In playing? ' + in_playing)

    if (in_queue || in_history || in_playing) {
      throw {code: 1, msg: 'song already in playlist!'}
    } else {
      this.list.addToQueue(song_data)
      debug('[debug] Songs in queue after pushing')
      debug(this.list.getQueue())
    }
  }

  newList (songList) {
    for (const song of songList) {
      try {
        this.newSong(song)
      }
      catch (err) {
        debug('[debug] Something bad catched.')
        debug('[debug]', err)
        if(err.code != 1) throw err
      }
    }
  }

  async newSongByYoutubeId (id) {
    console.log('[info]  New song: ' + id)
    var song_data = await this.fetcher.fetchVideo(id)
    this.newSong(song_data)
    this.dispatcher.updateList({queue: this.list.getQueue(), history: this.list.getHistory()})
  }

  async newListByYoutubeId (id) {
    console.log('[info]  New list: ' + id)
    var songList = await this.fetcher.fetchList(id)
    this.newList(songList)
    this.dispatcher.updateList({queue: this.list.getQueue(), history: this.list.getHistory()})
  }

  // Read
  getQueue () {
    console.log('[info]  Get Queue')
    return this.list.getQueue()
  }

  getHistory () {
    console.log('[info]  Get History')
    return this.list.getHistory()
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
    this.dispatcher.updateListSocket(socket, {queue: this.list.getQueue(), history: this.list.getHistory()})
  }

  updatePlaying (socket) {
    console.log('[info]  Update playing!')
    this.dispatcher.updatePlayingSocket(socket, {playing: this.playing})
  }

  // Global update
  nextSong () {
    console.log('[info]  Next song!')
    var song_data = this.list.nextSong()

    if (this.playing && this.playing !== song_data) { this.list.addToHistory(this.playing) }
    this.playing = song_data

    if (this.mode == 'service') { this.fakeplayer.play(this.playing) }

    this.dispatcher.getSong({playing: this.playing, queue: this.list.getQueue(), history: this.list.getHistory()})
    return song_data
  }

  setSong (id) {
    console.log('[info]  Set song: ' + id)
    if (this.playing) this.list.addToHistory(this.playing)
    var song_data = this.list.removeFromQueue(id)
    this.playing = song_data
    this.dispatcher.getSong({playing: this.playing, queue: this.list.getQueue(), history: this.list.getHistory()})
    return song_data
  }

  pushQueue (id) {
    console.log('[info]  Push song to queue: ' + id)
    var song_data = this.list.removeFromHistory(id)
    this.list.addToQueue(song_data)
    this.dispatcher.updateList({queue: this.list.getQueue, history: this.list.getHistory()})
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
    var poped = this.list.removeFromQueue(id)
    this.dispatcher.updateList({playing: this.playing, queue: this.list.getQueue(), history: this.list.getHistory()})
    return poped
  }

  removeHistory (id) {
    console.log('[info]  Del history: ' + id)
    var poped = this.list.removeFromHistory(id)
    this.dispatcher.updateList({playing: this.playing, queue: this.list.getQueue(), history: this.list.getHistory()})
    return poped
  }
}

module.exports = Playlist
