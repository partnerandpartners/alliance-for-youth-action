/* global jQuery, Fuse */
(function ($) {
  function initializeSearch () {
    if (!window.searchData || $('#search-input').length !== 1) {
      return
    }

    var options = {
      shouldSort: true,
      tokenize: true,
      threshold: 0.4,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 3,
      keys: [
        'title'
      ]
    }

    var fuse = new Fuse(window.searchData, options)

    $(document).on('input', '#search-input', function () {
      var value = $(this).val()
      var result = fuse.search(value)
      $('#search-results').text(JSON.stringify(result, null, 2))
    })

    console.log(window.searchData)
  }

  function handleModals () {
    $(document).on('click', '.modal', function (e) {
      $('.modal.visible').removeClass('visible')
      $('body').removeClass('.modal-open')
    })

    $(document).on('click', '.open-mailing-list-modal', function (e) {
      e.preventDefault()

      $('.mailing-list-modal').addClass('visible')
    })

    $(document).on('click', '.modal-content', function (e) {
      e.preventDefault()
      e.stopPropagation()
    })

    $(document).on('click', '.close-modal', function (e) {
      e.preventDefault()
      $('.modal.visible').removeClass('visible')
      $('body').removeClass('modal-open')
    })
  }

  function initializeSlick () {
    $('.header-images').slick({
      dots: true,
      prevArrow: '<button type="button" class="slick-prev">&#65308;</button>',
      nextArrow: '<button type="button" class="slick-next">&#65310;</button>'
    })

    $('.small-slider').slick({
      dots: true,
      arrows: false
    })
  }

  $(document).ready(function () {
    initializeSearch()

    initializeSlick()

    handleModals()
  })
})(jQuery)
