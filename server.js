// Setup basic express server
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;

// Other requires
const request = require('request');
const path = require('path');
const localip = require('internal-ip').v4();
const config = require('config');

// Discord.js
const discord_token = config.get('discord_token');
const discord_prefix = config.get('discord_prefix');
const discord_channelName = config.get('discord_channelName');
const Discord = require('discord.js');
const discord = new Discord.Client();

// Login to discord
discord.login(discord_token);

// Init playlist
const Playlist = require('./playlist');
var playlist = new Playlist();

// Start Server
server.listen(port, function () {
	console.log('Server listening at port %d', port);
});

// ejs init
app.set('views', path.join(__dirname,'view'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// Static folder
app.use(express.static(path.join(__dirname+'/public')));

// Routing
app.get('/', function(req, res) {
    if(/127.0.0.1|::1/.test(req.ip)) // in ipv6 localhost look like `::ffff:127.0.0.1`
		res.render('index', {serverip: localip});//sendFile(path.join(__dirname+'/view/index.html'));
	else
		res.redirect('/client');
})
app.get('/client', function(req, res) {
	res.render('index', {serverip: localip});
})

// Websocket
io.on('connection', function (socket) {
	// Create
	socket.on('new song', function (data) {
		var id = data.id;
		playlist.newSong(id, function (list) {
			io.emit('update list', list);
		}, function (err) {
			socket.emit('err', err)
		})
	});
	socket.on('new list', function (data) {
		var id = data.id;
		playlist.newList(id, function (list) {
			io.emit('update list', list);
		}, function (err) {
			socket.emit ('err', err)
		})
	});

	// Read
	socket.on('get list', function (data) {
		var queue = playlist.getQueue()
		var history = playlist.getHistory()
		io.emit('update list', {queue: queue, history: history});
	})
	socket.on('get playing', function (data) {
		var playing = playlist.getPlaying()
		socket.emit('update playing', {playing: playing});
	})
	socket.on('next song', function(data) {
		var list = playlist.nextSong();
		io.emit('get song', list);
	})
	socket.on('get volume', function() {
		var volume = playlist.getVolume();
		socket.emit('get volume', volume);
	});

	// Update
	socket.on('push queue', function(data) {
		var id = data.id;
		var list = playlist.pushQueue(id);
		io.emit('update list', list);
	})
	socket.on('set volume', function(value) {
		var volume = playlist.setVolume(value);
		io.emit('set volume', volume);
	});
	socket.on('set playing', function(data) {
		var id = data.id;
		var playing = playlist.setSong(id);
		var list = playlist.removeQueue(id);
		io.emit('update list', list);
		io.emit('set song', playing);
	});

	// Delete
	socket.on('remove queue', function (data) {
		var id = data.id;
		var list = playlist.removeQueue(id);
		io.emit('update list', list);
	})
	socket.on('remove history', function (data) {
		var id = data.id;
		var list = playlist.removeHistory(id);
		io.emit('update list', list);
	})

	// Player Control
	socket.on('pauseplay', function() {
		console.log('[info]  Pause/Play');
		io.emit('pauseplay');
	});
});

// Discord
discord.on("message", message => {
	if(message.author.bot) return;
	if(message.channel.name !== discord_channelName) return;
	if(message.content.indexOf(discord_prefix) !== 0) return;

	const args = message.content.slice(discord_prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();

	switch(command) {
		case "help":
			var msg = "[Command list]\n"
				+ "/playing : Get information of currently playing song. \n"
				+ "/add [youtube_url] : Add a song.\n"
				+ "/next : Skip current song.\n"
				+ "/playpause : Play/Pause current song.\n"
				+ "/controller : Show controller.\n"
			message.channel.send(msg);
			break;
		case "say":
			var msg = args.join(" ");
			message.delete().catch(O_o=>{});
			message.channel.send(msg);
			break;
		case "playing":
			var playing = playlist.getPlaying()
			if(playing) {
				var msg = playing.title+"\n"
					+ playing.url;
				message.channel.send(msg);
				break;
			} else {
				message.channel.send("Nothing playing.");
				break;
			}
		case "add":
			var url = args[0];
			if(url == "") {
				message.channel.send("Nothing to play!");
				break;
			}
			var match = url.match(/(youtube.com|youtu.be)\/(watch\?)?(\S+)/);
			var playlist_match = url.match(/(youtube.com|youtu.be)\/(playlist\?)(\S+)/);
			if(playlist_match) {
				message.channel.send("Playlist:");
				var params = {}
				playlist_match[3].split("&").map(function(d) {
					var sp = d.split("=");
					params[sp[0]] = sp[1];
				})
				var id = params['list'];
				playlist.newList(id, function (list) {
					if(list.title !== undefined) {
						var title = list.title;
						title.forEach(function (t){
							message.channel.send(t)
						});
					}
				}, function (err){
					message.channel.send("Playlist has been corrupted");
				})
			} else if(match) {
				var params = {};
				match[3].split("&").map(function(d) {
					var sp = d.split("=");
					if(sp.length == 2)
						params[sp[0]] = sp[1];
					else
						params['v'] = sp[0];
				})
				var id = params['v'];
				playlist.newSong(id, function (list) {
					var song = list.queue[list.queue.length-1];
					var msg = song.title+"\n"
						+ '<' + song.url + '>' ;
					message.channel.send(msg);
					io.emit('update list', list);
				}, function (err) {
					message.channel.send("Things gets crazy!");
				})
			} else {
				message.channel.send("Invalid Youtube url!");
			}
			break;
		case "next":
			var list = playlist.nextSong();
			io.emit('get song', list);
			message.channel.send("Wanna skip a song!");
			break;
		case "playpause":
			console.log('[info]  Pause/Play');
			io.emit('pauseplay');
			message.channel.send("Wanna play/pause a song!");
			break;
		case "controller":
			Promise.resolve()
				.then(() => message.react("⏯"))
				.then(() => message.react("⏭"))
				.then(() => message.react("➖"))
				.then(() => message.react("➕"))
			break;
	}

});

discord.on("messageReactionAdd", reactionController);
discord.on("messageReactionRemove", reactionController);

function reactionController(messageReaction, user) {
	var message = messageReaction.message;
	if(user.id == discord.user.id) return;
	if(message.channel.name !== discord_channelName) return;
	var emoji = messageReaction.emoji;
	var volume = Number(playlist.getVolume())
	var volumeTic = 3
	switch(emoji.name) {
		case "⏭":
			var list = playlist.nextSong();
			io.emit('get song', list);
			break;
		case "⏯":
			console.log('[info]  Pause/Play');
			io.emit('pauseplay');
			break;
		case "➕":
			if(volume >= 100) console.log('[warning] Volume bound');
			else {
				console.log('[info]  Volume up');
				volume += volumeTic
				playlist.setVolume(volume)
				io.emit('set volume', volume);
			}
			break;
		case "➖":
			if(volume <= 0) console.log('[warning] Volume bound');
			else {
				console.log('[info]  Volume down');
				volume -= volumeTic
	  	  playlist.setVolume(volume)
				io.emit('set volume', volume);
			}
			break;
	}
}

