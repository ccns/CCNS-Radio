// Youtube
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '150',
    width: '100%',
    videoId: '12hYTyzvEMg',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

function onPlayerReady(event) {
  io().emit('get list');
  io().emit('get playing');
}

function onPlayerStateChange(event) {
  if(event.data === 0) {
    io().emit('get song');
  }
}

function play(id) {
  load(id);
  player.playVideo();
}

function load(id) {
  player.cueVideoById(id, 0, "highres");
}

$(function() {
  // next song
  $('#next').click(function(){
    player.stopVideo();
    io().emit('next song');
  });

  // playpause
  $('#playpause').click(function(){
    var stat = player.getPlayerState();
    console.log(stat);
    switch(stat) {
      case 1:
        player.pauseVideo();
        break;
      case 2:
      case 5:
        player.playVideo();
        updatePlayingByIFrame();
        break;
      default:
        player.stopVideo();
        io().emit('next song');
    }
  });

  // radio
  $('#radio').click(function(){
    play('12hYTyzvEMg');
    updatePlayingByIFrame();
  });

  // submit request
  $("#submit-request").click(function(){
    var urls = $("#urls").val().split("\n");
    var fail = [];
    urls.map(function(url) {
      if(url == "") return;
      var match = url.match(/(youtube.com|youtu.be)\/(watch\?)?(\S+)/);
      if(match) {
        var data = {};
        var params = {};
        match[3].split("&").map(function(d) {
          var sp = d.split("=");
          if(sp.length == 2)
            params[sp[0]] = sp[1];
          else
            params['v'] = sp[0];
        })
        data.id = params['v'];
        io().emit('new song', data);
      } else {
        fail.push(url);
      }
    })
    if(fail.length) {
      fail = fail.join("\n");
      $("#urls").val("Invalid Urls:\n"+fail);
    } else {
      $("#urls").val("");
    }
  });

  // socket.io listeners
  io().on('get song', function (data) {
    console.log(data);
    play(data.playing.id);
    updateList(data);
    updatePlaying(data);
  });
  io().on('update list', function (data) {
    console.log(data);
    updateList(data);
  });
  io().on('update playing', function (data) {
    console.log(data);
    updatePlaying(data);
  });
});
