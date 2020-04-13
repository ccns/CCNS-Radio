const YoutubeVideoFetcher = require('./fetcher.js')
const FakePlayer = require('./fakeplayer.js')
const {FirestoreList, LocalList} = require('./listmodel.js')

function debug(...err) {
  if (process.env.DEBUG) {
    console.log(...err)
  }
}

class Playlist {
  constructor (dispatcher, config, mode) {
    if (config.database === "firestore") {
      this.list = new FirestoreList()
    } else if (config.database === "local") {
      this.list = new LocalList()
    }
    this.volume = 50

    this.dispatcher = dispatcher
    this.mode = mode
    this.fetcher = new YoutubeVideoFetcher(config)

    if (mode == 'service') {
      this.fakeplayer = new FakePlayer(this)
      this.nextSong()
    }
  }

  async newSong (song_data) {
    var id = song_data.id;

    var in_queue = (await this.list.searchQueue(id)) !== undefined
    var in_history = (await this.list.searchHistory(id)) !== undefined

    // playing is not empty -> playing.id !== id -> false
    // playing is empty -> false
    var playing = await this.list.getPlaying()
    var in_playing = !(playing === undefined || (playing.id !== id))
    debug('[debug] Check if new song already exist')
    debug('[debug] In queue? ' + in_queue)
    debug('[debug] In history? ' + in_history)
    debug('[debug] In playing? ' + in_playing)

    if (in_queue || in_history || in_playing) {
      throw {code: 1, msg: 'song already in playlist!'}
    } else {
      debug('[debug] Add song to queue')
      await this.list.addToQueue(song_data)
      debug('[debug] Songs in queue after pushing')
      debug(await this.list.getQueue())
    }
  }

  async newList (songList) {
    for (const song of songList) {
      try {
        await this.newSong(song)
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
    await this.newSong(song_data)
    this.dispatcher.updateList({queue: await this.list.getQueue(), history: await this.list.getHistory()})
  }

  async newListByYoutubeId (id) {
    console.log('[info]  New list: ' + id)
    var songList = await this.fetcher.fetchList(id)
    await this.newList(songList)
    this.dispatcher.updateList({queue: await this.list.getQueue(), history: await this.list.getHistory()})
  }

  // Read
  async getQueue () {
    console.log('[info]  Get Queue')
    return await this.list.getQueue()
  }

  async getHistory () {
    console.log('[info]  Get History')
    return await this.list.getHistory()
  }

  async getPlaying () {
    var playing = await this.list.getPlaying()
    console.log('[info]  Get Playing: ' + playing)
    return playing
  }

  getVolume () {
    console.log('[info]  Get volumn: ' + this.volume)
    return this.volume
  }

  // Socket update
  async updateList (socket) {
    console.log('[info]  Update list!')
    this.dispatcher.updateListSocket(socket, {queue: await this.list.getQueue(), history: await this.list.getHistory()})
  }

  async updatePlaying (socket) {
    console.log('[info]  Update playing!')
    this.dispatcher.updatePlayingSocket(socket, {playing: await this.list.getPlaying()})
  }

  // Global update
  async nextSong () {
    console.log('[info]  Next song!')
    var song_data = await this.list.getNextSong()

    if (this.mode == 'service') { this.fakeplayer.play(song_data) }

    this.dispatcher.getSong({playing: await this.list.getPlaying(), queue: await this.list.getQueue(), history: await this.list.getHistory()})
    return song_data
  }

  async setSong (id) {
    console.log('[info]  Set song: ' + id)
    await this.list.pushToPlaying(id)
    this.dispatcher.getSong({playing: await this.list.getPlaying(), queue: await this.list.getQueue(), history: await this.list.getHistory()})
  }

  async pushQueue (id) {
    console.log('[info]  Push song to queue: ' + id)
    var song_data = await this.list.removeFromHistory(id)
    await this.list.addToQueue(song_data)
    this.dispatcher.updateList({queue: await this.list.getQueue(), history: await this.list.getHistory()})
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

  async play () {
    console.log('[info]  Play')
    if(!(await this.list.getPlaying())) {
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
  async removeQueue (id) {
    console.log('[info]  Del queue: ' + id)
    var poped = await this.list.removeFromQueue(id)
    this.dispatcher.updateList({playing: await this.list.getPlaying(), queue: await this.list.getQueue(), history: await this.list.getHistory()})
    return poped
  }

  async removeHistory (id) {
    console.log('[info]  Del history: ' + id)
    var poped = await this.list.removeFromHistory(id)
    this.dispatcher.updateList({playing: await this.list.getPlaying(), queue: await this.list.getQueue(), history: await this.list.getHistory()})
    return poped
  }
}

module.exports = Playlist
