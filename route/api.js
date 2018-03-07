var express = require('express')

class ApiRouter {
  constructor (playlist) {
    this.router = express.Router()
    this.playlist = playlist

    var self = this

    // Control api
    this.router.post('/play', function (req, res) {
      self.playlist.play()
      res.send('Play')
    })

    this.router.post('/pause', function (req, res) {
      self.playlist.pause()
      res.send('Pause')
    })

    this.router.post('/next', function (req, res) {
      self.playlist.nextSong()
      res.send('Next song')
    })
  }

  getRouter () {
    return this.router
  }
}

module.exports = ApiRouter
