var express = require('express')

class ApiRouter {
  constructor (playlist) {
    this.router = express.Router()
    this.playlist = playlist

    // Control api
    this.router.post('/play', function (req, res) {
      this.playlist.play()
      res.send('Play')
    })

    this.router.post('/pause', function (req, res) {
      this.playlist.pause()
      res.send('Pause')
    })

    this.router.post('/next', function (req, res) {
      this.playlist.next()
      res.send('Next song')
    })
  }

  getRouter () {
    return this.router
  }
}

module.exports = ApiRouter
