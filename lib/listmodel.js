const Firestore = require('@google-cloud/firestore');

const japari = {
  id: 'xkMdLcB_vNU',
  title: 'TVアニメ『けものフレンズ』主題歌「ようこそジャパリパークへ / どうぶつビスケッツ×PPP」',
  url: 'https://youtu.be/xkMdLcB_vNU',
  duration: 'PT1M33S'
}

class FirestoreList {
  constructor (config) {
    this.db = new Firestore({
      projectId: config.projectId,
      credentials: config.credentials,
    });
  }
}

class LocalList {
  constructor () {
    this.queue = []
    this.history = []
  }

  addToQueue (song_data) {
    this.queue.push(song_data)
  }

  removeFromQueue (id) {
    var poped
    this.queue = this.queue.filter(function (d) {
      if (d.id !== id) return true
      else {
        poped = d
        return false
      }
    })
    return poped
  }

  getQueue () {
    return this.queue
  }

  searchQueue (id) {
    return this.queue.find(function (d) { return d.id === id })
  }

  addToHistory (song_data) {
    this.history.push(song_data)
  }

  removeFromHistory (id) {
    var poped
    this.history = this.history.filter(function (d) {
      if (d.id !== id) return true
      else {
        poped = d
        return false
      }
    })
    return poped
  }

  getHistory () {
    return this.history
  }

  searchHistory (id) {
    return this.history.find(function (d) { return d.id === id })
  }

  nextSong () {
    var song_data = null

    if (this.queue.length) {
      song_data = this.queue.shift()
    } else if (this.history.length) {
      song_data = this.history.splice(Math.floor(Math.random() * this.history.length), 1)[0]
    } else if (this.playing) {
      song_data = this.playing
    } else {
      console.log('[info]  No thing in the list! Play japari park!')
      song_data = japari
    }

    return song_data
  }

}

exports.FirestoreList = FirestoreList
exports.LocalList = LocalList
