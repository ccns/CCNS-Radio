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
app.use(express.static(path.join(__dirname+'/view')));

// Routing
app.get('/', function(req, res) {
  res.redirect('/push');
})
app.get('/push', function(req, res) {
  res.sendFile(path.join(__dirname+'/view/push.html'));
})
app.get('/play', function(req, res) {
  res.sendFile(path.join(__dirname+'/view/play.html'));
})

var queue = [];
var history = [{
  id: "12hYTyzvEMg",
  title: "純音樂電台 | Music➨24/7",
  url: "https://youtu.be/12hYTyzvEMg"
}];
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
    // console.log(in_queue);
    // console.log(in_history);

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
    console.log('get song!');

    var song_data;
    if(queue.length)
      song_data = queue.shift();
    else
      song_data = history.splice(Math.floor(Math.random()*history.length), 1)[0];

    if(playing)
      history.push(playing);
    playing = song_data;

    socket.broadcast.emit('get song', {playing: playing, queue: queue, history: history});
  })

  // Update
  socket.on('push queue', function(data) {
    var id = data.id;
    var index = history.map(function(d){return d.id;}).indexOf(id);
    var song_data = history.splice(index, 1)[0];
    playing = song_data;
    socket.broadcast.emit('get song', {playing: playing, queue: queue, history: history});
  })

  // Delete
  socket.on('del song', function (data) {
    console.log('del list');
    var id = data.id;
    queue = queue.filter(function(d){return d.id!=id;});
    history = history.filter(function(d){return d.id!=id;});
    socket.broadcast.emit('update list', {queue: queue, history: history});
  })
});
