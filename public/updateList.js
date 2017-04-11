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
    var x = $('<i class="fa fa-times del" aria-hidden="true" del="'+d.id+'"></i>')
      .css('cursor','pointer')
      .click(function() { io().emit('del song', {id: $(this).attr('del')}); })
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
    var x = $('<i class="fa fa-times del" aria-hidden="true" del="'+d.id+'"></i>')
      .css('cursor','pointer')
      .click(function() { io().emit('del song', {id: $(this).attr('del')}); })
      .appendTo(li);
  })
}
