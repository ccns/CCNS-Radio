const request = require('request')

const debug = process.env.DEBUG

class Playlist {
  constructor (dispatcher, config) {
    this.queue = []
    this.history = []
    this.playing = false
    this.volume = 50
    this.dispatcher = dispatcher
    this.api_key = config.youtube_api_key

    // Default song
    var song_data = {
      id: 'xkMdLcB_vNU',
      title: 'TVアニメ『けものフレンズ』主題歌「ようこそジャパリパークへ / どうぶつビスケッツ×PPP」',
      url: 'https://youtu.be/xkMdLcB_vNU'
    }
    this.queue.push(song_data)
  }

  // Create
  newSong (id) {
    console.log('[info]  New song: ' + id)
    var self = this

    return new Promise(function (resolve, reject) {
      var in_queue = self.queue.find(function (d) { return d.id === id })
      var in_history = self.history.find(function (d) { return d.id === id })

      // playing is not empty -> playing.id !== id -> false
      // playing is empty -> false
      var in_playing = !(!self.playing || (self.playing.id !== id))
      if (debug) {
        console.log('[debug] Check if new song already exist')
        console.log('[debug] In queue? ' + in_queue)
        console.log('[debug] In history? ' + in_history)
        console.log('[debug] In playing? ' + in_playing)
      }

      if (in_queue || in_history || in_playing) {
        reject(new Error('song already in playlist!'))
      }
      else {
        request('https://www.googleapis.com/youtube/v3/videos?part=snippet&key=' + self.api_key + '&id=' + id, function (err, res, body) {
          body = JSON.parse(body)
          if (!err && body.items.length > 0) {
            var title = body.items[0].snippet.title
            var url = 'https://youtu.be/' + id
            var song_data = {
              id: id,
              title: title,
              url: url
            }
            self.queue.push(song_data)
            if (debug) {
              console.log('[debug] Songs in queue after pushing')
              console.log(self.queue)
            }
            self.dispatcher.updateList({queue: self.queue, history: self.history})
            resolve(song_data)
          } else {
            console.log('[error] Invalid Youtube video ID.')
            reject({code: 1, msg: 'Invlid Youtube video ID.'})
          }
        })
      }
    })
  }

  newList (id) {
    console.log('[info]  New list: ' + id)
    var self = this

    return new Promise(function (resolve, reject) {
      request('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&key=' + self.api_key + '&playlistId=' + id, function (err, res, body) {
        body = JSON.parse(body)

        if (!err) {
          addAllSong(body.items).then(function (songList) {
            resolve(songList)
          })
        } else {
          console.log('[error] Invalid Youtube list ID.')
          reject({code: 1, msg: 'Invalid Youtube list ID.'})
        }
        async function addAllSong (items) {
          const songList = []
          console.log('[info]  List length: ' + items.length)
          for (const item of body.items) {
            const newSong = await self.newSong(item.snippet.resourceId.videoId)
            songList.push(newSong)
          }
          console.log('[info]  Finish adding list.')
          return songList
        }
      })
    })
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
    socket.emit('update list', {queue: this.queue, history: this.history})
  }

  updatePlaying (socket) {
    console.log('[info]  Update playing!')
    socket.emit('update playing', {playing: this.playing})
  }

  // Global update
  nextSong () {
    console.log('[info]  Next song!')
    var song_data

    if (this.queue.length) {
      song_data = this.queue.shift()
    } else if (this.history.length) {
      song_data = this.history.splice(Math.floor(Math.random() * this.history.length), 1)[0]
    } else if (this.playing) {
      song_data = this.playing
    } else {
      console.log('[error] Nothing to play!')
    }

    if (this.playing && this.playing !== song_data) { this.history.push(this.playing) }
    this.playing = song_data

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
    this.dispatcher.pausePlay()
  }

  play () {
    console.log('[info]  Play')
    this.dispatcher.play()
  }

  pause () {
    console.log('[info]  Pause')
    this.dispatcher.pause()
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
