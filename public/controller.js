var controller = {
  pausePlay: function () {
    var stat = player.getPlayerState()
    switch (stat) {
      case 1:
        player.pauseVideo()
        break
      case 2:
      case 5:
        player.playVideo()
        break
    }
  },
  setVolume: function (value) {
    player.setVolume(value)
    view.updateVolume(value)
  },
  play: function (value) {
    player.playVideo()
  },
  pause: function (value) {
    player.pauseVideo()
  }
}
