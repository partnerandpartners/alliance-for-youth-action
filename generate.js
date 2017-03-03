#!/usr/bin/env node

var config = require('config');
var axios = require('axios');
var pug = require('pug');
var fsp = require('fs-promise');
var path = require('path');
var minify = require('html-minifier').minify;
var _ = require('lodash');

config.templatesPath = path.resolve(__dirname, config.templatesFolder);
config.sitePath = path.resolve(__dirname, config.siteFolder);

function generate_front_page(siteData, templatesCompiled) {
  if( siteData.site.show_on_front === 'page' ) {
    var frontPage = _.find(siteData.posts, function(o) {
      return o.id === siteData.site.page_on_front
    })

    if (frontPage) {
      writeTemplate({post: frontPage}, templatesCompiled, 'index.pug', siteData);
    }
  } else if (siteData.site.show_on_front === 'posts' ) {
    // Render the blog page
  }
}

function generate_sitemap(siteData, templatesCompiled) {
  var postTemplate = templatesCompiled['sitemap.pug']
  var postRendered = postTemplate({site: siteData})
  var outputPath = path.join(config.sitePath, 'sitemap', 'index.html')

  fsp.outputFile(outputPath, postRendered)
}


//
// function generate_archive_pages(siteData, templatesCompiled) {
//   Object.keys(siteData.taxonomies).forEach((taxonomy) => {
//     var postTypesInTaxonomy = siteData.taxonomies[taxonomy].object_type;
//
//     siteData[taxonomy].forEach((taxonomyTerm) => {
//       var termPostIds = taxonomyTerm['posts']
//       var postsInTaxonomy = []
//
//       postTypesInTaxonomy.forEach(function(postType){
//         var postTypeTermPosts = _.filter(siteData[postType], function(o) {
//           return taxonomyTerm.posts.indexOf(o.id) !== -1;
//         })
//
//         postsInTaxonomy = postsInTaxonomy.concat(postTypeTermPosts)
//       })
//
//       var postTemplate = templatesCompiled['archive.pug']
//       var postRendered = postTemplate({posts: postsInTaxonomy, term: taxonomyTerm, site: siteData})
//       var postMinified = minify(postRendered,{
//         collapseWhitespace: true
//       })
//       var outputPath = path.join(config.sitePath, taxonomyTerm.permalink, 'index.html')
//
//       fsp.outputFile(outputPath, postMinified)
//     })
//   })
// }

function generate_post_type_archive_pages(siteData, templatesCompiled) {
  // @todo
}

function generate_singular_pages(siteData, templatesCompiled) {
  // var pages = siteData.posts.filter((post) => {
  //   return post.type === 'page'
  // })

  siteData.posts.forEach((page) => {
    if (page.id !== siteData.site.page_for_posts) {
      writeTemplate({post: page}, templatesCompiled, 'index.pug', siteData);
    }
  })
}

function generate_404_page(siteData, templatesCompiled) {
  var postTemplate = templatesCompiled['404.pug']
  var postRendered = postTemplate({site: siteData})
  var outputPath = path.join(config.sitePath, '404.html')

  fsp.outputFile(outputPath, postRendered)
}
//
// function generate_search_page(siteData) {
//
// }
//
// function generate_blog_post_index_pages(siteData, templatesCompiled) {
//   Object.keys(siteData.post_types).forEach(function(postType) {
//     siteData[postType].forEach(function(post) {
//       if( post.id === siteData.options.page_for_posts ) {
//
//         var postTemplate = templatesCompiled['index.pug']
//
//         var postRendered = postTemplate({posts: siteData.post, site: siteData})
//
//         var postMinified = minify(postRendered,{
//           collapseWhitespace: true
//         })
//
//         var outputPath = path.join(config.sitePath, post.permalink, 'index.html')
//
//         fsp.outputFile(outputPath, postMinified)
//       }
//     })
//   })
//
// }

function writeTemplate(data, templatesCompiled, template, siteData) {
  var postTemplate = templatesCompiled[template]

  var postRendered = postTemplate({post: data.post, site: siteData})

  var postMinified = minify(postRendered, {collapseWhitespace: true})

  var outputPath = path.join(config.sitePath, data.post.permalink, 'index.html');

  fsp.outputFile(outputPath, postMinified)
}

function fetchData() {
  console.log('loading endpoint and writing to a json file')

  return fsp.readJSON('site.json')
    .then((contents) => {
      if (!content) {
        throw err;
      } else {
        axios.get(config.endpoint)
      }
    })
    .then((response) => {
      return response.data
    })
    .then((data) => {
      return data;
    })
    .then((data) => {
      return fsp.writeJSON('site.json', data)
    })
    .then(() => {
      console.log('Wrote file to JSON.')
    })
}

function print_posts(data) {
  var postWritingPromises = data.posts.map(post => {
    console.log(path.join(__dirname, post.permalink, 'index.html'))
    return fsp.ensureFile(path.join(__dirname, '_site', post.permalink, 'index.html'))
  })
  console.log(data.posts.length)
  console.log(data.terms.length)
}

function downloadSiteData() {
  return axios.get(config.endpoint)
    .then(JSON.parse)
    .catch(function(err) {
      throw new Error('could not fetch data from endpoint.')
    })
}

function generate() {
  // Fetch the JSON for the site
  var dataPromise = fsp.readJSON('site.json')

  // Scan the directory folder for all the pug templates
  var templatesPromise = fsp.readdir(config.templatesPath)

  // Make sure the _site output directory exists before we start
  // building the site. This will empty it if it already exists.
  var ensureSiteDirPromise = fsp.ensureDir(config.sitePath)

  // Once we've got the site's JSON, loaded all the template filenames, & created or
  // emptied the destination directory, we will compile all the pug templates
  // just so that we can generate all the pages from them
  return Promise.all([dataPromise, templatesPromise, ensureSiteDirPromise])
    .then(values => {
      var siteData = values[0];//values[0].data;
      var templates = values[1];
      var templatesCompiled = {};

      // Compile all the available pug templates (synchronously)
      templates.forEach(function (templateFile) {
        if (path.extname(templateFile) === '.pug') {
          templatesCompiled[templateFile] = pug.compileFile(path.join(config.templatesPath, templateFile))
        }
      })

      generate_front_page(siteData, templatesCompiled);
      // generate_archive_pages(siteData, templatesCompiled);
      generate_sitemap(siteData, templatesCompiled);
      generate_singular_pages(siteData, templatesCompiled);
      generate_404_page(siteData, templatesCompiled);
      // generate_search_page(siteData);
      // generate_blog_post_index_pages(siteData, templatesCompiled);
    })
}

(function(){
  module.exports = generate

  if (!module.parent) {
    generate()
  }
})();
