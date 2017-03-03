// https://developer.wordpress.org/files/2014/10/template-hierarchy.png

function templateLocator(postType, id, slug) {
  var templates = ['index', 'singular', 'single', 'single-post']

  return templates;
}

module.exports = templateLocator
