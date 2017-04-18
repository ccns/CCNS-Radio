function plus(id) {
  socket.emit('push queue', {id: id})
}
function removeQueue(id) {
  socket.emit('remove queue', {id: id})
}
function removeHistory(id) {
  socket.emit('remove history', {id: id})
}
function nextSong() {
  socket.emit('next song');
}
function getList() {
  socket.emit('get list');
}
function getPlaying() {
  socket.emit('get playing');
}
function newSong(data) {
  socket.emit('new song', data);
}
