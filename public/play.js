var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '390',
    width: '640',
    videoId: '',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

function onPlayerReady(event) {
  io().emit('get song');
}

function onPlayerStateChange(event) {
  if(event.data === 0) {
    io().emit('get song');
  }
}

$(function() {
  function play(id) {
    player.loadVideoById(id, 5, "large")
  }
  $('#cut').click(function(){
    player.stopVideo();
    io().emit('get song');
  });
  var socket = io();
  socket.on('get song', function (data) {
    console.log(data);
    play(data.song.id);
    updateList(data);
  });
  socket.on('update list', function (data) {
    console.log(data);
    updateList(data);
  });
});
