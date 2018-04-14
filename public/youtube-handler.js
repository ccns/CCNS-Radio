function onYouTubeIframeAPIReady () {
  player = new YT.Player('player', {
    height: '150',
    width: '100%',
    videoId: 'xkMdLcB_vNU',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  })
}

function onPlayerReady (event) {
  initSocketIO()
  getList()
  getPlaying()
  getVolume()
  // mute if client
  if (window.location.pathname === '/client') { player.mute() }
}

function onPlayerStateChange (event) {
  if (event.data === 0) {
    nextSong()
  }
}


function play (id) {
  load(id)
  player.playVideo()
}

function load (id) {
  player.cueVideoById(id, 0, 'highres')
}
