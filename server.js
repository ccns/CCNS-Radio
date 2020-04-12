// Setup basic express server
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const port = process.env.PORT || 3000

// Other requires
const path = require('path')
const localip = require('internal-ip').v4()
const config = require('config')

/// Module initialization
// Init dispatcher
const Dispatcher = require('./lib/dispatcher')
var dispatcher = new Dispatcher(io)

// Init playlist
const playlist_config = config.get('playlist')
const Playlist = require('./lib/playlist')
var playlist = new Playlist(dispatcher, playlist_config)

// Init webcontroller
const WebController = require('./lib/webcontroller')
var webController = new WebController(playlist)

// Init API router
const ApiRouter = require('./route/api')
var apiRouter = new ApiRouter(playlist)

// Init Search router
const SearchRouter = require('./route/search')
var searchRouter = new SearchRouter(playlist_config.youtube_api_key)

// Init Discord Bot
const discord_config = config.get('discord')
if(discord_config.enabled) {
  const DiscordBot = require('./lib/discordbot')
  const discordBot = new DiscordBot(playlist, discord_config)
  discordBot.login()
}

/// Express setting
// Init EJS
app.set('views', path.join(__dirname, 'view'))
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')

// Static folder
app.use(express.static(path.join(__dirname, '/public')))

// Routing
app.get('/', function (req, res) {
    // in ipv6 localhost look like `::ffff:127.0.0.1`
    if (/127.0.0.1|::1/.test(req.ip)) {
      res.render('index', {serverip: localip})
    } else if(config.mode == 'station') {
      res.redirect('/control')
    } else if(config.mode == 'service') {
      res.redirect('/client')
    }
})

app.get('/control', function (req, res) {
  res.render('index', {serverip: localip})
})

app.get('/client', function (req, res) {
  res.render('index', {serverip: localip})
})

app.use('/api', apiRouter.getRouter())

app.use('/search', searchRouter.getRouter())

/// Start Server
server.listen(port, function () {
  console.log('Server listening at port %d', port)
})

/// Socket.io
io.on('connection', webController.connectionHandler())
