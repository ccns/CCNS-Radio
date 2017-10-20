function setSocketListeners() {
  // socket.io listeners
  socket.on('get song', function (data) {
    console.log(data);
    view.updateList(data);
    view.updatePlaying(data);
    play(data.playing.id);
  });
  socket.on('set song', function (data) {
    console.log(data);
    view.updatePlaying(data);
    play(data.playing.id);
  });
	socket.on('update list', function (data) {
    console.log(data);
    view.updateList(data);
  });
  socket.on('update playing', function (data) {
    console.log(data);
    if(data.playing) {
      view.updatePlaying(data);
      load(data.playing.id);
    }
  });
  socket.on('err', function (data) {
    console.log(data);
    errorHandler(data);
  })
  socket.on('set volume', function (data) {
    console.log(data);
    controller.setVolume(data);
  });
  socket.on('pauseplay', function (data) {
    console.log(data);
    controller.pausePlay(data);
  });
  socket.on('get volume', function (data) {
    console.log(data);
    controller.setVolume(data);
  });
}
