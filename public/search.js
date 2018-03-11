var resultListItemHtml = '<div class="item"> <div class="myListItem"> <div class="ts small image"> <img height="90" width="120" src="{image}"> </div> <div class="description"> <div class="ts header"><a href="{url}">{title}</a></div> <div> <button class="ts button searchAdd" song-id="{id}"> 加入 </button> </div> </div> </div> </div>'

function fetchSearchResult (query) {
  $.post('/search', {q: query}).done(function (data) {
    console.log(data)
    var list = $('#searchModal .ts.list')
    var items = data.items
    items.forEach(function (val, idx) {
      var itemHtml = resultListItemHtml
        .replace('{image}', val.thumbnail.url)
        .replace('{url}', val.url)
        .replace('{title}', val.title)
      var songId = val.id
      var item = $(itemHtml).click(function () {
        newSong({id: songId})
      })
      list.append(item)
    })
  })
}
