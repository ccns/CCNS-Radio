var view = {
  updateHistory: function(data) {
    var items = $("#history .ts.items").empty();
    $.each(data.history, function(d){
      d = data.history[d];
      var item = $('<div/>')
        .addClass('ts item')
        .appendTo(items);
      var plus_icon = $('<i/>')
        .addClass('plus icon')
        .css('box-sizing', 'content-box')
        .click(plus.bind(this, d.id))
        .appendTo(item);
      var remove_icon = $('<i/>')
        .addClass('remove icon')
        .click(removeHistory.bind(this, d.id))
        .appendTo(item);
      var a = $('<a/>')
        .text(d.title)
        .attr('href', d.url)
        .attr('target', '_blank')
        .appendTo(item);
    })
  },
  updateQueue: function(data) {
    var items = $("#queue .ts.items").empty();
    $.each(data.queue, function(d){
      d = data.queue[d];
      var item = $('<div/>')
        .addClass('ts item')
        .appendTo(items);
      var remove_icon = $('<i/>')
        .addClass('remove icon')
        .click(removeQueue.bind(this, d.id))
        .appendTo(item);
      var a = $('<a/>')
        .text(d.title)
        .attr('href', d.url)
        .attr('target', '_blank')
        .appendTo(item);
    })
  },
  updateList: function(data) {
    this.updateHistory(data);
    this.updateQueue(data);
  },
  updatePlaying: function(data) {
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
  },
  updatePlayingByIFrame: function() {
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
}
