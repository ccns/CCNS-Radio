const Discord = require('discord.js')

class DiscordBot {
  constructor (playlist, config, mode) {
    this.playlist = playlist
    this.token = config.token
    this.prefix = config.prefix
    this.commandChannelNames = config.commandChannelNames
    this.replyChannelName = config.replyChannelName
    this.mode = mode

    // Login to discord
    this.discord = new Discord.Client()

    // Register events
    this.discord.on('message', this.getMessage())
    this.discord.on('messageReactionAdd', this.reactionController())
    this.discord.on('messageReactionRemove', this.reactionController())
  }

  login () {
    this.discord.login(this.token)
  }

  getMessage (message) {
    var self = this

    return async function (message) {
      if (message.author.bot) return
      if (!self.commandChannelNames.includes(message.channel.name)) return
      if (message.content.indexOf(self.prefix) !== 0) return

      const replyChannel = message.guild.channels.find(channel => channel.name == self.replyChannelName)

      const args = message.content.slice(self.prefix.length).trim().split(/ +/g)
      const command = args.shift().toLowerCase()

      switch (command) {
        case 'help':
          var msg = '[Command list]\n' +
            '/playing : Get information of currently playing song. \n' +
            '/add [youtube_url] : Add a song.\n' +
            '/next : Skip current song.\n'
          if (this.mode == 'station') {
            msg += '/playpause : Play/Pause current song.\n' +
              '/controller : Show controller.\n'
          }
          replyChannel.send(msg)
          break
        case 'say':
          var msg = args.join(' ')
          message.delete().catch(O_o => {})
          replyChannel.send(msg)
          break
        case 'playing':
          var playing = await self.playlist.getPlaying()
          if (playing) {
            var msg = playing.title + '\n' + playing.url
            replyChannel.send(msg)
            break
          } else {
            replyChannel.send('Nothing playing.')
            break
          }
        case 'add':
          var url = args[0]
          if (url === '') {
            replyChannel.send('Nothing to add!')
            break
          }
          var match = url.match(/(youtube.com|youtu.be)\/(watch\?)?(\S+)/)
          var playlist_match = url.match(/(youtube.com|youtu.be)\/(playlist\?)(\S+)/)

          if (playlist_match) {
            /// / Add playlist
            // Parse url params
            var params = {}
            playlist_match[3].split('&').map(function (d) {
              var sp = d.split('=')
              params[sp[0]] = sp[1]
            })
            var id = params['list']
            // Add list to playlist
            replyChannel.send('Loading playlist ...')
            await self.playlist.newListByYoutubeId(id).then(function (list) {
              if (list !== undefined) {
                replyChannel.send('**Adding songs**')
                list.forEach(function (song_data) {
                  var msg = song_data.title + '\n' +
                    '<' + song_data.url + '>'
                  replyChannel.send(msg)
                })
                replyChannel.send('**' + list.length + '** songs added.')
              }
            }).catch(function (err) {
              console.log('[error] Something bad happened.')
              console.log('[error-info]', err)
              replyChannel.send('Playlist has been corrupted')
            })
          } else if (match) {
            /// / Add song
            // Parse url parameter
            var params = {}
            match[3].split('&').map(function (d) {
              var sp = d.split('=')
              if (sp.length === 2) { params[sp[0]] = sp[1] } else { params['v'] = sp[0] }
            })
            var id = params['v']
            // Add new song to playlist
            await self.playlist.newSongByYoutubeId(id).then(function (song_data) {
              var msg = '**Song added**\n' +
                song_data.title + '\n' +
                '<' + song_data.url + '>'
              replyChannel.send(msg)
            }).catch(function (err) {
              if (err.code == 1) {
                replyChannel.send('The song is already in the list O3O')
              } else {
                console.log('[error] Something bad happened.')
                console.log('[error-info]', err)
                replyChannel.send('An alien ate your request!')
              }
            })
          } else {
            replyChannel.send('Invalid Youtube url!')
          }
          break
        case 'next':
          await self.playlist.nextSong()
          replyChannel.send('Someone wanna skip a song!')
          break
        case 'playpause':
          if (this.mode == 'station') {
            await self.playlist.pauseplay()
            replyChannel.send('Someone wanna play/pause a song!')
            break
          }
        case 'controller':
          if (this.mode == 'station') {
            Promise.resolve()
              .then(() => message.react('⏯'))
              .then(() => message.react('⏭'))
              .then(() => message.react('➖'))
              .then(() => message.react('➕'))
            break
          }
      }
    }
  }

  reactionController (messageReaction, user) {
    var self = this

    return async function (messageReaction, user) {
      var message = messageReaction.message
      if (user.id === self.discord.user.id) return
      if (message.channel.name !== self.replyChannelName) return
      var emoji = messageReaction.emoji
      var volumeTic = 3
      switch (emoji.name) {
        case '⏭':
          await self.playlist.nextSong()
          break
        case '⏯':
          await self.playlist.pausePlay()
          break
        case '➕':
          var volume = Number(await self.playlist.getVolume())
          if (volume >= 100) console.log('[warning] Volume bound')
          else {
            console.log('[info]  Volume up')
            volume += volumeTic
            await self.playlist.setVolume(volume)
          }
          break
        case '➖':
          var volume = Number(await self.playlist.getVolume())
          if (volume <= 0) console.log('[warning] Volume bound')
          else {
            console.log('[info]  Volume down')
            volume -= volumeTic
            await self.playlist.setVolume(volume)
          }
          break
      }
    }
  }
}

module.exports = DiscordBot
