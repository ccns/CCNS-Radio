const Discord = require('discord.js')

class DiscordBot {
  constructor (playlist, config) {
    this.playlist = playlist
    this.token = config.token
    this.prefix = config.prefix
    this.channel = config.channelName

    // Login to discord
    this.discord = new Discord.Client()
    this.discord.login(this.token)

    // Register events
    this.discord.on('message', this.getMessage)
    this.discord.on('messageReactionAdd', this.reactionController)
    this.discord.on('messageReactionRemove', this.reactionController)
  }

  getMessage (message) {
    if (message.author.bot) return
    if (message.channel.name !== discord_channelName) return
    if (message.content.indexOf(discord_prefix) !== 0) return

    const args = message.content.slice(discord_prefix.length).trim().split(/ +/g)
    const command = args.shift().toLowerCase()

    switch (command) {
      case 'help':
        var msg = '[Command list]\n' +
          '/playing : Get information of currently playing song. \n' +
          '/add [youtube_url] : Add a song.\n' +
          '/next : Skip current song.\n' +
          '/playpause : Play/Pause current song.\n' +
          '/controller : Show controller.\n'
        message.channel.send(msg)
        break
      case 'say':
        var msg = args.join(' ')
        message.delete().catch(O_o => {})
        message.channel.send(msg)
        break
      case 'playing':
        var playing = playlist.getPlaying()
        if (playing) {
          var msg = playing.title + '\n' +
            playing.url
          message.channel.send(msg)
          break
        } else {
          message.channel.send('Nothing playing.')
          break
        }
      case 'add':
        var url = args[0]
        if (url === '') {
          message.channel.send('Nothing to play!')
          break
        }
        var match = url.match(/(youtube.com|youtu.be)\/(watch\?)?(\S+)/)
        var playlist_match = url.match(/(youtube.com|youtu.be)\/(playlist\?)(\S+)/)
        if (playlist_match) {
          message.channel.send('Playlist:')
          var params = {}
          playlist_match[3].split('&').map(function (d) {
            var sp = d.split('=')
            params[sp[0]] = sp[1]
          })
          var id = params['list']
          playlist.newList(id, function (list) {
            if (list.title !== undefined) {
              var title = list.title
              title.forEach(function (t) {
                message.channel.send(t)
              })
            }
          }, function (err) {
            message.channel.send('Playlist has been corrupted')
          })
        } else if (match) {
          var params = {}
          match[3].split('&').map(function (d) {
            var sp = d.split('=')
            if (sp.length == 2) { params[sp[0]] = sp[1] } else { params['v'] = sp[0] }
          })
          var id = params['v']
          playlist.newSong(id, function (list) {
            var song = list.queue[list.queue.length - 1]
            var msg = song.title + '\n' +
              '<' + song.url + '>'
            message.channel.send(msg)
            this.io.emit('update list', list)
          }, function (err) {
            message.channel.send('Things gets crazy!')
          })
        } else {
          message.channel.send('Invalid Youtube url!')
        }
        break
      case 'next':
        var list = playlist.nextSong()
        this.io.emit('get song', list)
        message.channel.send('Wanna skip a song!')
        break
      case 'playpause':
        this.io.emit('pauseplay')
        message.channel.send('Wanna play/pause a song!')
        break
      case 'controller':
        Promise.resolve()
          .then(() => message.react('⏯'))
          .then(() => message.react('⏭'))
          .then(() => message.react('➖'))
          .then(() => message.react('➕'))
        break
    }
  }

  reactionController (messageReaction, user) {
    var message = messageReaction.message
    if (user.id == discord.user.id) return
    if (message.channel.name !== discord_channelName) return
    var emoji = messageReaction.emoji
    var volume = Number(playlist.getVolume())
    var volumeTic = 3
    switch (emoji.name) {
      case '⏭':
        var list = playlist.nextSong()
        this.io.emit('get song', list)
        break
      case '⏯':
        this.io.emit('pauseplay')
        break
      case '➕':
        if (volume >= 100) console.log('[warning] Volume bound')
        else {
          console.log('[info]  Volume up')
          volume += volumeTic
          playlist.setVolume(volume)
          this.io.emit('set volume', volume)
        }
        break
      case '➖':
        if (volume <= 0) console.log('[warning] Volume bound')
        else {
          console.log('[info]  Volume down')
          volume -= volumeTic
          playlist.setVolume(volume)
          this.io.emit('set volume', volume)
        }
        break
    }
  }
}

module.exports = DiscordBot
