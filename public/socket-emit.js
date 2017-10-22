function plus (id) {
  socket.emit('push queue', {id: id})
}
function removeQueue (id) {
  socket.emit('remove queue', {id: id})
}
function removeHistory (id) {
  socket.emit('remove history', {id: id})
}
function setPlaying (id) {
  socket.emit('set playing', {id: id})
}
function nextSong () {
  socket.emit('next song')
}
function getList () {
  socket.emit('get list')
}
function getPlaying () {
  socket.emit('get playing')
}
function newSong (data) {
  socket.emit('new song', data)
}
function newList (data) {
  socket.emit('new list', data)
}
function setVolume (value) {
  socket.emit('set volume', value)
}
function getVolume (value) {
  socket.emit('get volume', value)
}
function pausePlay (value) {
  socket.emit('pauseplay', value)
}
