// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

var request = require('request');

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

var queue = [];
var history = [];
io.on('connection', function (socket) {
  socket.on('get list', function (data) {
    console.log('get list');
    socket.broadcast.emit('update list', {queue: queue, history: history});
  })
  socket.on('del song', function (data) {
    console.log('del list');
    var id = data.id;
    queue = queue.filter(function(d){return d.id!=id;});
    history = history.filter(function(d){return d.id!=id;});
    socket.broadcast.emit('update list', {queue: queue, history: history});
  })
  socket.on('new song', function (data) {
    console.log('new song: '+data.id);
    var id = data.id;

    var in_queue = queue.find(function(d){return d.id==id;});
    var in_history = history.find(function(d){return d.id==id;});

    if( !in_queue && !in_history ) {
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
        history.push(song_data);
        socket.broadcast.emit('update list', {queue: queue, history: history});
      })
    } else if( !in_queue ) {
      queue.push(in_history);
      socket.broadcast.emit('update list', {queue: queue, history: history});
    } else {
      socket.broadcast.emit('update list', {queue: queue, history: history});
    }
  });

  socket.on('get song', function(data) {
    console.log('get song!');
    if(queue.length)
      socket.broadcast.emit('get song', {song: queue.shift(), queue: queue, history: history});
    else
      socket.broadcast.emit('get song', {song: history[Math.floor(Math.random()*history.length)], queue: queue, history: history});
  })
});
