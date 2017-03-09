const _ = require('lodash')

// For reference:
// https://developer.wordpress.org/files/2014/10/template-hierarchy.png

function templateLocator (post) {
  var templates = ['index']

  switch (post.type) {
    case 'search': {
      templates.push('search')
      break
    }

    case '404': {
      templates.push('404')
      break
    }

    case 'post': {
      templates.push('singular')
      templates.push('single')
      templates.push('single-post')
      break
    }

    case 'page': {
      templates.push('singular')
      templates.push('page')
      templates.push('page-' + post.id)
      templates.push('page-' + post.slug)
      break
    }

    case 'post_type_archive': {
      templates.push('archive')
      if (post.postType) {
        templates.push('archive-' + post.postType)
      } else {
        throw new Error('A post_type_archive should have a `postType` associated with it.')
      }
      break
    }

    case 'taxonomy_term_archive': {
      templates.push('taxonomy')
      templates.push('taxonomy-' + post.taxonomy)
      templates.push('taxonomy-' + post.taxonomy + '-' + post.term.slug)
      break
    }

    default: {
      break
    }
  }

  templates = templates.map((templateSlug) => {
    return templateSlug + '.pug'
  })

  templates = _.reverse(templates)

  return templates
}

module.exports = templateLocator
