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
      part: 'snippet',
      id: id
    }).catch((err) => {
      console.log('[error] Something bad happened.')
      console.log('[error-info]', err)
      throw {code: 1, msg: 'Something bad happened.'}
    })

    var title = res.data.items[0].snippet.title
    var url = 'https://youtu.be/' + id
    var song_data = {
      id: id,
      title: title,
      url: url
    }

    return song_data
  }

  async fetchList (id) {
    const res = await this.api.playlistItems.list({
      part: 'snippet',
      maxResults: 50,
      playlistId: id
    }).catch((err) => {
      console.log('[error] Something bad happened.')
      console.log('[error-info]', err)
      throw {code: 1, msg: 'Something bad happened.'}
    })

    const items = res.data.items
    const songList = []
    console.log('[info]  List length: ' + items.length)
    for (const item of items) {
      var id = item.snippet.resourceId.videoId
      var title = item.snippet.title
      var url = 'https://youtu.be/' + id
      var song_data = {
        id: id,
        title: title,
        url: url
      }
      songList.push(song_data)
    }
    console.log('[info]  Finish adding list.')
    return songList
  }
}

module.exports = YoutubeVideoFetcher
