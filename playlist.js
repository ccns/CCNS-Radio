const request = require('request');

const debug = process.env.DEBUG;

function Playlist() {
  this.queue = [];
  this.history = [];
  this.playing = false;
  this.volume = 50;
}

// Create
Playlist.prototype.newSong = function(id, callback, error) {
  console.log('[info]  New song: '+id);
  var self = this;

  var in_queue = this.queue.find(function(d){return d.id==id;});
  var in_history = this.history.find(function(d){return d.id==id;});
  // playing is not empty -> playing.id!=id -> false
  // playing is empty -> false
  var in_playing = !(!this.playing || (this.playing.id!=id));
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
        self.queue.push(song_data);
        if(debug) {
          console.log("[debug] Songs in queue after pushing")
          console.log(self.queue);
        }
        callback({queue: self.queue, history: self.history})
      } else {
        console.log("[error] Invalid Youtube video ID.");
        error({code: 1, msg: 'Invlid Youtube video ID.'})
      }
    })
  } else {
    callback({queue: self.queue, history: self.history})
  }
}

Playlist.prototype.newList = function(id, callback, error) {
  console.log('[info]  New list: '+id);
	var self = this;
  request('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&key=AIzaSyD0H-vB9MILeb3nwzpoWYL96puFi_8dsCs&playlistId='+id, function(err, res, body) {
		var body = JSON.parse(body);
		try {
			var title = []
			var len = body.items.length;
			console.log("[info]  List length: "+len);
			body.items.forEach(function (item) {
				self.newSong(item.snippet.resourceId.videoId, callback, error);
				title.push(item.snippet.title);
			});
    	callback({queue: self.queue, history: self.history, title: title})
		} catch(err) {
			console.log("[error] Invalid Youtube list ID.");
			error({code: 1, msg: 'Invalid Youtube list ID.'});
		}
	});
}

// Read
Playlist.prototype.getQueue = function() {
  console.log('[info]  Get Queue');
  return this.queue;
}
Playlist.prototype.getHistory = function() {
  console.log('[info]  Get History');
  return this.history;
}
Playlist.prototype.getPlaying = function() {
  console.log('[info]  Get Playing: '+this.playing);
  return this.playing;
}
Playlist.prototype.getVolume = function() {
  console.log('[info]  Get volumn: '+this.volume);
  return this.volume;
}
Playlist.prototype.nextSong = function() {
  var song_data;
  if(this.queue.length)
    song_data = this.queue.shift();
  else if(this.history.length)
    song_data = this.history.splice(Math.floor(Math.random()*this.history.length), 1)[0];
  else if(this.playing)
    song_data = this.playing;

  if(this.playing && this.playing != song_data)
    this.history.push(this.playing);
  this.playing = song_data;

  return {playing: this.playing, queue: this.queue, history: this.history};
}

// Update
Playlist.prototype.pushQueue = function(id, callback) {
  console.log('[info]  Push song to queue: '+id);
  var index = this.history.map(function(d){return d.id;}).indexOf(id);
  var song_data = this.history.splice(index, 1)[0];
  this.queue.push(song_data);
  return {queue: this.queue, history: this.history};
}
Playlist.prototype.setVolume = function(val) {
  console.log('[info]  Set volume: '+val);
  this.volume = val;
  return this.volume;
}

// Delete
Playlist.prototype.removeQueue = function(id) {
  console.log('[info]  Del queue: '+id);
  this.queue = this.queue.filter(function(d){return d.id!=id;});
  return {queue: this.queue, history: this.history};
}
Playlist.prototype.removeHistory = function(id) {
  console.log('[info]  Del history: '+id);
  this.history = this.history.filter(function(d){return d.id!=id;});
  return {queue: this.queue, history: this.history};
}

module.exports = Playlist;
