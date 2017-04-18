// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var debug = process.env.DEBUG || false;

// Other requires
var request = require('request');
var path = require('path');
var localip = require('internal-ip').v4();

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
  if(req.ip=='::1')
    res.render('index', {serverip: localip});//sendFile(path.join(__dirname+'/view/index.html'));
  else
    res.redirect('/client');
})
app.get('/client', function(req, res) {
  res.render('index', {serverip: localip});
})

var queue = [];
var history = [];
var playing = false;
var volume = 50;
io.on('connection', function (socket) {
  // Create
  socket.on('new song', function (data) {
    console.log('[info]  New song: '+data.id);
    var id = data.id;

    var in_queue = queue.find(function(d){return d.id==id;});
    var in_history = history.find(function(d){return d.id==id;});
    // playing is not empty -> playing.id!=id -> false
    // playing is empty -> false
    var in_playing = !(!playing || (playing.id!=id));
    if(debug) {
      console.log("[debug] Check if new song already exist")
      console.log("[debug] In queue? "+in_queue);
      console.log("[debug] In history? "+in_history);
      console.log("[debug] In playing? "+in_playing);
    }

    if( !in_queue && !in_history && !in_playing ){
      request('https://www.googleapis.com/youtube/v3/videos?part=snippet&key=AIzaSyD0H-vB9MILeb3nwzpoWYL96puFi_8dsCs&id='+id, function(err, res, body){
        var body = JSON.parse(body);
        if(body.items.length > 0) {
          var title = body.items[0].snippet.title;
          var url = 'https://youtu.be/'+id;
          var song_data = {
            id: id,
            title: title,
            url: url
          };
          queue.push(song_data);
          if(debug) {
            console.log("[debug] Songs in queue after pushing")
            console.log(queue);
          }
          io.emit('update list', {queue: queue, history: history});
        } else {
          console.log("[error] Invalid Youtube video ID.");
          socket.emit('err', {code: 1, msg: 'Invalid Youtube video ID.'})
        }
      })
    } else {
      io.emit('update list', {queue: queue, history: history});
    }
  });

  // Read
  socket.on('get list', function (data) {
    console.log('[info]  Get list');
    io.emit('update list', {queue: queue, history: history});
  })
  socket.on('get playing', function (data) {
    console.log('[info]  Get playing');
    socket.emit('update playing', {playing: playing});
  })
  socket.on('next song', function(data) {
    console.log('[info]  Next song!');

    var song_data;
    if(queue.length)
      song_data = queue.shift();
    else if(history.length)
      song_data = history.splice(Math.floor(Math.random()*history.length), 1)[0];
    else if(playing)
      song_data = playing;

    if(playing && playing != song_data)
      history.push(playing);
    playing = song_data;

    io.emit('get song', {playing: playing, queue: queue, history: history});
  })
  socket.on('get volume', function() {
    console.log('[info]  Get volumn');
    socket.emit('get volume', volume);
  });

  // Update
  socket.on('push queue', function(data) {
    var id = data.id;
    var index = history.map(function(d){return d.id;}).indexOf(id);
    var song_data = history.splice(index, 1)[0];
    queue.push(song_data);
    io.emit('update list', {queue: queue, history: history});
  })
  socket.on('set volume', function(value) {
    console.log('[info]  Set volumn: '+value);
    volume = value;
    io.emit('set volume', value);
  });

  // Delete
  socket.on('remove queue', function (data) {
    console.log('[info]  Del queue: '+data.id);
    var id = data.id;
    queue = queue.filter(function(d){return d.id!=id;});
    io.emit('update list', {queue: queue, history: history});
  })
  socket.on('remove history', function (data) {
    console.log('[info]  Del history: '+data.id);
    var id = data.id;
    history = history.filter(function(d){return d.id!=id;});
    io.emit('update list', {queue: queue, history: history});
  })

  // Player Control
  socket.on('pauseplay', function() {
    console.log('[info]  Pause/Play');
    io.emit('pauseplay');
  });
});
