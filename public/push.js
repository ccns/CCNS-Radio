$(function() {
  var socket = io();
  $("#submit").click(function(){
    var data = {};
    data.id = $("#url").val().split('=')[1];
    socket.emit('new song', data);
  })
});
