const Firestore = require('@google-cloud/firestore');
const FieldValue = require('firebase-admin').firestore.FieldValue;

function debug(...err) {
  if (process.env.DEBUG) {
    console.log(...err)
  }
}

const japari = {
  id: 'xkMdLcB_vNU',
  title: 'TVアニメ『けものフレンズ』主題歌「ようこそジャパリパークへ / どうぶつビスケッツ×PPP」',
  url: 'https://youtu.be/xkMdLcB_vNU',
  duration: 'PT1M33S'
}

class FirestoreList {
  constructor () {
    this.db = new Firestore({
      projectId: process.env.FIRESTORE_PROJECT_ID,
      credentials: JSON.parse(process.env.FIRESTORE_CREDENTIALS)
    })
    this.queueRef = this.db.collection('queue')
    this.historyRef = this.db.collection('history')
    this.playingRef = this.db.collection('playing').doc('playing')
  }

  async getPlaying () {
    var doc = await this.playingRef.get().catch((err) => {
      console.log("[info]  Error getting document:", err)
    })
    if (doc.exists) {
      return doc.data()
    }
    return
  }

  async setPlaying (song_data) {
    await this.playingRef.set(song_data).catch((err) => {
      console.log("[info]  Error getting document:", err)
    })
  }

  async pushToPlaying (id) {
    var playing = await this.getPlaying()
    if (playing) await this.addToHistory(playing)

    var song_data = await this.removeFromQueue(id)
    if (song_data) await this.setPlaying(song_data)
  }

  async addToQueue (song_data) {
    await this.queueRef.doc(song_data.id).set({ ...song_data, createdAt: FieldValue.serverTimestamp()}).catch((err) => {
      console.log("[info]  Error getting document:", err)
    })
  }

  async removeFromQueue (id) {
    var poped
    var doc = await this.queueRef.doc(id).get().catch((err) => {
      console.log("[info]  Error getting document:", err)
    })

    if (doc.exists) {
      poped = doc.data()
      await this.queueRef.doc(id).delete().catch((err) => {
        console.log("[info]  Error deleting document:", err)
      })
    }
    return poped
  }

  async getQueue () {
    var queue = []
    var snapshot = await this.queueRef.orderBy('createdAt').get().catch((err) => {
      console.log("[info]  Error getting document:", err)
    })

    if (!snapshot.empty) {
      snapshot.forEach((doc) => {
        queue.push(doc.data())
      })
    }
    return queue
  }

  async searchQueue (id) {
    var song_data
    var doc = await this.queueRef.doc(id).get().catch((err) => {
      console.log("[info]  Error getting document:", err)
    })

    if (doc.exists) {
      song_data = doc.data()
    }
    return song_data
  }

  async addToHistory (song_data) {
    await this.historyRef.doc(song_data.id).set(song_data).catch((err) => {
      console.log("[info]  Error getting document:", err)
    })
  }

  async removeFromHistory (id) {
    var poped
    var doc = await this.historyRef.doc(id).get().catch((err) => {
      console.log("[info]  Error deleting document:", err)
    })

    if (doc.exists) {
      poped = doc.data()
      await this.historyRef.doc(id).delete().catch((err) => {
        console.log("[info]  Error deleting document:", err)
      })
    }
    return poped
  }

  async getHistory () {
    var history = []
    var snapshot = await this.historyRef.get().catch((err) => {
      console.log("[info]  Error getting document:", err)
    })

    if (!snapshot.empty) {
      snapshot.forEach((doc) => {
        history.push(doc.data())
      })
    }
    return history
  }

  async searchHistory (id) {
    var song_data
    var doc = await this.historyRef.doc(id).get().catch((err) => {
      console.log("[info]  Error getting document:", err)
    })

    if (doc.exists) {
      song_data = doc.data()
    }
    return song_data
  }

  async getNextSong () {
    var song_data
    var queue = await this.getQueue()
    var history = await this.getHistory()
    var playing = await this.getPlaying()

    if (queue.length) {
      song_data = queue[0]
      await this.removeFromQueue(song_data.id)
    } else if (history.length) {
      song_data = history[Math.floor(Math.random() * history.length)]
      await this.removeFromHistory(song_data.id)
    } else if (playing) {
      song_data = playing
    } else {
      console.log('[info]  No thing in the list! Play japari park!')
      song_data = japari
    }

    if (playing && playing !== song_data) { await this.addToHistory(playing) }
    await this.setPlaying(song_data)

    return song_data
  }
}

class LocalList {
  constructor () {
    this.queue = []
    this.history = []
    this.playing
  }

  getPlaying () {
    return this.playing
  }

  setPlaying (song_data) {
    this.playing = song_data
  }

  pushToPlaying (id) {
    if (this.playing) this.addToHistory(this.playing)
    var song_data = this.removeFromQueue(id)

    this.setPlaying(song_data)
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

  getNextSong () {
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

    if (this.playing && this.playing !== song_data) { this.addToHistory(this.playing) }
    this.setPlaying(song_data)

    return song_data
  }

}

exports.FirestoreList = FirestoreList
exports.LocalList = LocalList
