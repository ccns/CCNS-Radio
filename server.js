// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

// Other requires
var request = require('request');
var path = require('path');

// Start Server
server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Static folder
app.use(express.static(path.join(__dirname+'/public')));

// Routing
app.get('/', function(req, res) {
  if(req.ip=='::1')
    res.sendFile(path.join(__dirname+'/view/index.html'));
  else
    res.redirect('/client');
})
app.get('/client', function(req, res) {
  res.sendFile(path.join(__dirname+'/view/index.html'));
})

var queue = [];
var history = [];
var playing = false;
io.on('connection', function (socket) {
  // Create
  socket.on('new song', function (data) {
    console.log('new song: '+data.id);
    var id = data.id;

    var in_queue = queue.find(function(d){return d.id==id;});
    var in_history = history.find(function(d){return d.id==id;});
    // playing is not empty -> playing.id!=id -> false
    // playing is empty -> false
    var in_playing = !(!playing || (playing.id!=id));
    // console.log("New[debug]")
    // console.log(in_queue);
    // console.log(in_history);
    // console.log(in_playing);

    if( !in_queue && !in_history && !in_playing ){
      request('https://www.googleapis.com/youtube/v3/videos?part=snippet&key=AIzaSyD0H-vB9MILeb3nwzpoWYL96puFi_8dsCs&id='+id, function(err, res, body){
        var body = JSON.parse(body);
        var title = body.items[0].snippet.title;
        var url = 'https://youtu.be/'+id;
        var song_data = {
          id: id,
          title: title,
          url: url
        };
        queue.push(song_data);
        console.log(queue);
        socket.broadcast.emit('update list', {queue: queue, history: history});
      })
    } else {
      socket.broadcast.emit('update list', {queue: queue, history: history});
    }
  });

  // Read
  socket.on('get list', function (data) {
    console.log('get list');
    socket.broadcast.emit('update list', {queue: queue, history: history});
  })
  socket.on('get playing', function (data) {
    console.log('get playing');
    socket.broadcast.emit('update playing', {playing: playing});
  })
  socket.on('next song', function(data) {
    console.log('next song!');

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

    socket.broadcast.emit('get song', {playing: playing, queue: queue, history: history});
  })

  // Update
  socket.on('push queue', function(data) {
    var id = data.id;
    var index = history.map(function(d){return d.id;}).indexOf(id);
    var song_data = history.splice(index, 1)[0];
    queue.push(song_data);
    socket.broadcast.emit('update list', {queue: queue, history: history});
  })

  // Delete
  socket.on('remove queue', function (data) {
    console.log('del queue');
    var id = data.id;
    queue = queue.filter(function(d){return d.id!=id;});
    socket.broadcast.emit('update list', {queue: queue, history: history});
  })
  socket.on('remove history', function (data) {
    console.log('del history');
    var id = data.id;
    history = history.filter(function(d){return d.id!=id;});
    socket.broadcast.emit('update list', {queue: queue, history: history});
  })
});
