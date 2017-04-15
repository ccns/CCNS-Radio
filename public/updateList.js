function plus() {
  var id = $(this).attr('yid');
  io().emit('push queue', {id: id})
}
function remove() {
  var id = $(this).attr('yid');
  io().emit('remove song', {id: id})
}
function updateHistory(data) {
  var items = $("#history .ts.items").empty();
  $.each(data.history, function(d){
    d = data.history[d];
    var item = $('<div/>')
      .addClass('ts item')
      .appendTo(items);
    var plus_icon = $('<i/>')
      .addClass('plus icon')
      .css('box-sizing', 'content-box')
      .click(plus)
      .appendTo(item);
    var remove_icon = $('<i/>')
      .addClass('remove icon')
      .attr('yid', d.id)
      .click(remove)
      .appendTo(item);
    var a = $('<a/>')
      .text(d.title)
      .attr('href', d.url)
      .attr('target', '_blank')
      .appendTo(item);
  })
}
function updateQueue(data) {
  var items = $("#queue .ts.items").empty();
  $.each(data.queue, function(d){
    d = data.queue[d];
    var item = $('<div/>')
      .addClass('ts item')
      .appendTo(items);
    var remove_icon = $('<i/>')
      .addClass('remove icon')
      .attr('yid', d.id)
      .click(remove)
      .appendTo(item);
    var a = $('<a/>')
      .text(d.title)
      .attr('href', d.url)
      .attr('target', '_blank')
      .appendTo(item);
  })
}
function updateList(data) {
  updateHistory(data);
  updateQueue(data);
}
function updatePlaying(data) {
  var d = data.playing;
  if(d) {
    $("#playing")
      .text(d.title)
      .attr('href', d.url)
      .attr('target', '_blank');
  } else {
    $("#playing")
      .text("Nothing playing ...");
  }
}
function updatePlayingByIFrame() {
  var s = player.getPlayerState();
  if(s >= 0) {
    var d = player.getVideoData();
    $("#playing")
      .text(d.title)
      .attr('href', 'https://youtu.be/'+d.video_id)
      .attr('target', '_blank');
  } else {
    $("#playing")
      .text("Nothing playing ...");
  }
}
