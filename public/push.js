$(function() {
  var socket = io();
  $("#submit").click(function(){
    var data = {};
    data.id = $("#url").val().split('=')[1].split('&')[0];
    socket.emit('new song', data);
  });
  io().on('update list', function (data) {
    console.log(data);
    updateList(data);
  });
  io().emit('get list');
});
