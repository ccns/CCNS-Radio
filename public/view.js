var view = {
  updateHistory: function (data) {
    var items = $('#history .ts.items').empty()
    $.each(data.history, function (d) {
      d = data.history[d]
      var item = $('<div/>')
        .addClass('ts item')
        .appendTo(items)
      var plus_icon = $('<button/>')
        .addClass('ts icon button')
        .click(plus.bind(this, d.id))
        .append('<i class="plus icon list-icon"></i>')
        .appendTo(item)
      var remove_icon = $('<button/>')
        .addClass('ts icon button')
        .click(removeHistory.bind(this, d.id))
        .append('<i class="remove icon list-icon"></i>')
        .appendTo(item)
      var a = $('<a/>')
        .text(d.title)
        .attr('href', d.url)
        .attr('target', '_blank')
        .appendTo(item)
    })
  },
  updateQueue: function (data) {
    var items = $('#queue .ts.items').empty()
    $.each(data.queue, function (d) {
      d = data.queue[d]
      var item = $('<div/>')
        .addClass('ts item')
        .appendTo(items)
      // don't show playnow button if client
      if (window.location.pathname !== '/client') {
        var playnow_icon = $('<button/>')
          .addClass('ts icon button')
          .click(setPlaying.bind(this, d.id))
          .append('<i class="angle double left icon list-icon"></i>')
          .appendTo(item)
      }
      var remove_icon = $('<button/>')
        .addClass('ts icon button')
        .click(removeQueue.bind(this, d.id))
        .append('<i class="remove icon list-icon"></i>')
        .appendTo(item)
      var a = $('<a/>')
        .text(d.title)
        .attr('href', d.url)
        .attr('target', '_blank')
        .appendTo(item)
    })
  },
  updateList: function (data) {
    this.updateHistory(data)
    this.updateQueue(data)
  },
  updatePlaying: function (data) {
    var d = data.playing
    if (d) {
      $('#playing')
        .text(d.title)
        .attr('href', d.url)
        .attr('target', '_blank')
    } else {
      $('#playing')
        .text('Nothing playing ...')
    }
  },
  updatePlayingByIFrame: function () {
    var s = player.getPlayerState()
    if (s >= 0) {
      var d = player.getVideoData()
      $('#playing')
        .text(d.title)
        .attr('href', 'https://youtu.be/' + d.video_id)
        .attr('target', '_blank')
    } else {
      $('#playing')
        .text('Nothing playing ...')
    }
  },
  updateVolume: function (value) {
    $('#volume').val(value)
    $('.volume.icon').removeClass('down off up')

    if (value === 0) { $('.volume.icon').addClass('off') } else if (value < 50) { $('.volume.icon').addClass('down') } else { $('.volume.icon').addClass('up') }
  }
}
