$(function() {
  var socket = io();
  $("#submit").click(function(){
    var data = {};
    var urls = $("#url").val().split("\n");
    urls.map(function(url) {
      var match = url.match(/(youtube.com|youtu.be)\/(watch\?)+(\S+)/);
      if(match) {
        var params = {};
        match[3].split("&").map(function(d) {
          var sp = d.split("=");
          params[sp[0]] = sp[1];
        })
        data.id = params['v'];
        socket.emit('new song', data);
      } else {
        alert("Invalid url: "+url);
      }
    })
  });
  io().on('update list', function (data) {
    console.log(data);
    updateList(data);
  });
  io().emit('get list');
});
