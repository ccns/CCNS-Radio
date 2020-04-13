const {google} = require('googleapis')

class YoutubeVideoFetcher {
  constructor (config) {
    this.api = google.youtube({
      version: 'v3',
      auth: config.youtube_api_key
    })
  }

  async fetchVideo (id) {
    const res = await this.api.videos.list({
      part: 'snippet,contentDetails',
      id: id
    }).catch((err) => {
      console.log('[error] Something bad happened.')
      console.log('[error-info]', err)
      throw {code: -1, msg: 'Something bad happened.'}
    })

    if (res.data.items.length == 0) {
      throw {code: 2, msg: 'Song cannot be accessed.'}
    }

    var title = res.data.items[0].snippet.title
    var url = 'https://youtu.be/' + id
    var duration = res.data.items[0].contentDetails.duration
    var song_data = {
      id: id,
      title: title,
      url: url,
      duration: duration
    }

    return song_data
  }

  async fetchList (id) {
    const res = await this.api.playlistItems.list({
      part: 'snippet,contentDetails',
      maxResults: 50,
      playlistId: id
    }).catch((err) => {
      console.log('[error] Something bad happened.')
      console.log('[error-info]', err)
      throw {code: -1, msg: 'Something bad happened.'}
    })

    const items = res.data.items
    const songList = []
    console.log('[info]  List length: ' + items.length)
    for (const item of items) {
      var id = item.snippet.resourceId.videoId
      var song_data = await this.fetchVideo(id).catch((err) => {
        if(err.code < 0) throw err
      })
      if(song_data) { songList.push(song_data) }
    }
    console.log('[info]  Finish retrieving list.')
    return songList
  }

  async search (query, pageToken) {
    const res = await this.api.search.list({
      q: query,
      maxResults: 25,
      type: 'video,playlist',
      part: 'snippet',
      pageToken: pageToken
    }).catch((err) => {
      console.log('[error] Something bad happened when search.')
      console.log('[error-info]', err)
      throw {code: -1, msg: 'Something bad happened.'}
    })

    var items = res.data.items
    var nextPageToken = res.nextPageToken
    var prevPageToken = res.prevPageToken
    items = items.map(function (item) {
      return {
        id: item.id.videoId,
        title: item.snippet.title,
        url: 'https://youtu.be/' + item.id.videoId,
        thumbnail: item.snippet.thumbnails.default
      }
    })
    return {items: items, nextPageToken: nextPageToken, prevPageToken: prevPageToken}
  }
}

module.exports = YoutubeVideoFetcher
