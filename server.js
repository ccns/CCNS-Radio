// Setup basic express server
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const port = process.env.PORT || 3000

// Other requires
const request = require('request')
const path = require('path')
const localip = require('internal-ip').v4()
const config = require('config')

const Dispatcher = require('./lib/dispatcher')
var dispatcher = new Dispatcher(io)

// Init playlist
const playlist_config = config.get('playlist')
const Playlist = require('./lib/playlist')
var playlist = new Playlist(dispatcher, playlist_config)

// Init webcontroller
const WebController = require('./lib/webcontroller')
var webController = new WebController(playlist)

// Route
const ApiRouter = require('./route/api')
var apiRouter = new ApiRouter(playlist)

// Discord.js
const discord_config = config.get('discord')
const DiscordBot = require('./lib/discordbot')
const discordBot = new DiscordBot(playlist, discord_config)

// Start Server
server.listen(port, function () {
  console.log('Server listening at port %d', port)
})

// ejs init
app.set('views', path.join(__dirname, 'view'))
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')

// Static folder
app.use(express.static(path.join(__dirname + '/public')))

// Routing
app.get('/', function (req, res) {
  if (/127.0.0.1|::1/.test(req.ip)) // in ipv6 localhost look like `::ffff:127.0.0.1`
  { res.render('index', {serverip: localip}) } // sendFile(path.join(__dirname+'/view/index.html'));
  else { res.redirect('/client') }
})

app.get('/client', function (req, res) {
  res.render('index', {serverip: localip})
})

app.use('/api', apiRouter.getRouter())

// Websocket
io.on('connection', webController.connectionHandler())
