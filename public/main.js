$(function () {
  // next song
  $('#next').click(function () {
    nextSong()
  })

  // Button click listeners
  // playpause
  $('#playpause').click(function () {
    pausePlay()
  })

  // radio
  $('#radio').click(function () {
    play('xkMdLcB_vNU')
    view.updatePlaying({
      playing: {
        id: 'xkMdLcB_vNU',
        title: 'ようこそジャパリパークへ',
        url: 'https://youtu.be/xkMdLcB_vNU'
      }
    })
  })

  // handle user enter input
  $('#urls').keydown(function (event) {
    if (event.keyCode === 13 && !event.shiftKey) {
      event.preventDefault()
      $('#submit-request').click()
      $('#urls').val('')
    }
  })

  // submit request
  $('#submit-request').click(function () {
    var urls = $('#urls').val().split('\n')
    var fail = []
    urls.map(function (url) {
      parsed = urlParser.parse(url)
      if (parsed && parsed.provider === 'youtube') {
        let data = {}
        switch (parsed.mediaType) {
          case 'video':
            data.id = parsed.id
            newSong(data)
            break
          case 'playlist':
            data.id = parsed.list
            newList(data)
            break
          default:
            fail.push(url)
        }
      }
      else {
        fail.push(url)
      }
    })
    if (fail.length) {
      fail = fail.join('\n')
      $('#urls').val('Invalid Urls:\n' + fail)
    } else {
      $('#urls').val('')
    }
  })

  // volume change
  $('#volume').change(function () {
    var value = $(this).val()
    setVolume(value)
  })

  // hide if client
  if (window.location.pathname === '/client') {
    $('#player').hide()
  }

  // Open search modal
  $('#open-search-modal').click(function () {
    $('#searchModalDimmer').addClass('active')
  })
  $('#close-search-modal').click(function () {
    $('#searchModalDimmer').removeClass('active')
  })

  // Fetching search result
  $('#searchSubmit').click(function () {
    var list = $('#searchModal .ts.list').empty()
    var query = $('#searchQuery').val()
    fetchSearchResult(query)
  })
  $('#searchQuery').keypress(function (e) {
    if (e.which == 13) $('#searchSubmit').click()
  })
})
