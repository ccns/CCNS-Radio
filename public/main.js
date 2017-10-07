$(function() {
  // get socket after document ready
  setSocketListeners();

  // load youtube player
  $.getScript("https://www.youtube.com/iframe_api");

  // next song
  $('#next').click(function(){
    nextSong();
  });

  // Button click listeners
  // playpause
  $('#playpause').click(function(){
    pausePlay();
  });

  // radio
  $('#radio').click(function(){
    play('xkMdLcB_vNU');
    view.updatePlaying({
      playing: {
        id: 'xkMdLcB_vNU',
        title: 'ようこそジャパリパークへ',
        url: 'https://youtu.be/xkMdLcB_vNU'
      }
    });
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
        newSong(data);
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

  // volume change
  $("#volume").change(function() {
    var value = $(this).val();
    setVolume(value);
  })

  // hide if client
  if(window.location.pathname == '/client') {
    $("#player").hide();
  }
});
