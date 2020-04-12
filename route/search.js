const YoutubeVideoFetcher = require('../lib/fetcher.js')
const express = require('express')
const bodyParser = require('body-parser')

class SearchRouter {
  constructor (config) {
    this.router = express.Router()
    this.fetcher = new YoutubeVideoFetcher(config)

    this.router.use(bodyParser.urlencoded({ extended: false }))
    this.router.use(bodyParser.json())

    var self = this

    this.router.post('/', function (req, res) {
      var q = req.body.q
      var pageToken = req.body.pageToken

      self.fetcher.search(q, pageToken).then(function (data) {
        res.json(data)
      }).catch(function (err) {
        res.send('Failed')
      })
    })
  }

  getRouter () {
    return this.router
  }
}

module.exports = SearchRouter
