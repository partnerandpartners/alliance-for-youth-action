// https://developer.wordpress.org/files/2014/10/template-hierarchy.png

function templateLocator(post) {
  var templates = ['index'];

  switch (post.type) {
    case 'search':
      templates.push('search')
      break;

    case '404':
      templates.push('404')
      break;

    case 'post':
      templates.push('singular');
      templates.push('single');
      templates.push('single-post');
      break;

    case 'page':
      templates.push('singular');
      templates.push('page');
      templates.push('page-' + post.id);
      templates.push('page-' + post.slug);
      break;

    case 'post_type_archive':
      templates.push('archive')
      templates.push('archive-' + post.post_type_archive_type)
      break;

    default:
      break;
  }

  return templates;
}

module.exports = templateLocator
