const request = require('request')
const express = require('express')
const bodyParser = require('body-parser')

class SearchRouter {
  constructor (api_key) {
    this.router = express.Router()
    this.api_key = api_key
    this.base_url = 'https://www.googleapis.com/youtube/v3/search?part=snippet&key=' + this.api_key

    this.router.use(bodyParser.urlencoded({ extended: false }))
    this.router.use(bodyParser.json())

    var self = this

    this.router.post('/', function (req, res) {
      var q = req.body.q
      var pageToken = req.body.pageToken

      if (typeof pageToken === 'undefined') {
        self.search(q).then(function (data) {
          res.json(data)
        }).catch(function (err) {
          res.send('Failed')
          console.log(err)
        })
      } else {
        self.nextPage(q, pageToken).then(function (data) {
          res.json(data)
        }).catch(function (err) {
          res.send('Failed')
          console.log(err)
        })
      }
    })
  }

  getRouter () {
    return this.router
  }

  search (query) {
    var q = query
    var maxResults = 25
    var type = 'video,playlist'

    var url = this.base_url +
              '&q=' + query +
              '&maxResults=' + maxResults +
              '&type=' + type

    return new Promise(function (resolve, reject) {
      request(url, function (err, res, body) {
        var body = JSON.parse(body)
        if (!err) {
          var items = body.items
          var nextPageToken = body.nextPageToken
          var prevPageToken = body.prevPageToken
          items = items.map(function (item) {
            return {
              id: item.id.videoId,
              title: item.snippet.title,
              url: 'https://youtu.be/' + item.id.videoId,
              thumbnail: item.snippet.thumbnails.default
            }
          })
          resolve({items: items, nextPageToken: nextPageToken, prevPageToken: prevPageToken})
        } else {
          console.log('[error] Search failed.')
          reject(err)
        }
      })
    })
  }

  nextPage (query, pageToken) {
    var q = query
    var maxResults = 25
    var type = 'video,playlist'

    var url = this.base_url +
              '&q=' + query +
              '&maxResults=' + maxResults +
              '&type=' + type +
              '&pageToken=' + pageToken

    return new Promise(function (resolve, reject) {
      request(url, function (err, res, body) {
        var body = JSON.parse(body)
        if (!err) {
          var items = body.items
          var nextPageToken = body.nextPageToken
          var prevPageToken = body.prevPageToken
          items = items.map(function (item) {
            return {
              id: item.id.videoId,
              title: item.snippet.title,
              url: 'https://youtu.be/' + item.id.videoId,
              thumbnail: item.snippet.thumbnails.default
            }
          })
          resolve({items: items, nextPageToken: nextPageToken, prevPageToken: prevPageToken})
        } else {
          console.log('[error] Search failed.')
          reject()
        }
      })
    })
  }
}

module.exports = SearchRouter
