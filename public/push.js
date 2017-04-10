$(function() {
  function updateList(data) {
    var queue_ul = $("#queue ul").empty();
    $.each(data.queue, function(d){
      d = data.queue[d];
      var li = $('<li/>')
        .appendTo(queue_ul);
      var aa = $('<a/>')
        .text(d.title)
        .attr('href', d.url)
        .attr('target', '_blank')
        .appendTo(li);
    })
    var history_ul = $("#history ul").empty();
    $.each(data.history, function(d){
      d = data.history[d];
      var li = $('<li/>')
        .appendTo(history_ul);
      var aa = $('<a/>')
        .text(d.title)
        .attr('href', d.url)
        .attr('target', '_blank')
        .appendTo(li);
    })
  }
  var socket = io();
  $("#submit").click(function(){
    var data = {};
    data.id = $("#url").val().split('=')[1].split('&')[0];
    socket.emit('new song', data);
  });
  io().on('new song', function (data) {
    console.log(data);
    updateList(data);
  });
  io().emit('get list');
});
