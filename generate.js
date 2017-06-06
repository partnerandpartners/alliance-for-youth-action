const axios = require('axios')
const config = require('config')
const pug = require('pug')
const fsp = require('fs-promise')
const path = require('path')
const minify = require('html-minifier').minify
const _ = require('lodash')
const templateLocator = require('./lib/template-locator')
const mediaDownloader = require('./lib/media-downloader')
const replaceMediaReferences = require('./lib/replace-media-references')

config.templatesPath = path.resolve(__dirname, config.templatesFolder)
config.sitePath = path.resolve(__dirname, config.siteFolder)

function normalizeSiteData (siteData) {
  siteData = replaceMediaReferences(siteData)
  siteData.posts.forEach((post) => {
    var terms = siteData.terms.filter(term => {
      return post.taxonomyTermIds.indexOf(term.id) !== -1
    })

    post.terms = terms
  })

  // Associate news & research posts with campaign posts
  siteData.posts.forEach(possibleCampaign => {
    if (possibleCampaign.type === 'campaign') {
      possibleCampaign.newsPosts = []
      possibleCampaign.researchPosts = []

      siteData.posts.forEach(post => {
        if (post.type === 'post') {
          // News posts
          var isNewsPost = post.terms.filter(term => {
            return term.name === 'News' && term.taxonomy === 'category'
          })
          if (isNewsPost.length) {
            if (post.hasOwnProperty('associatedCampaign') && post.associatedCampaign.indexOf(possibleCampaign.id) !== -1) {
              possibleCampaign.newsPosts.push(post)
            }
          }

          // Reasearch posts
          var isResearchPost = post.terms.filter(term => {
            return term.name === 'Research' && term.taxonomy === 'category'
          })
          if (isResearchPost.length) {
            if (post.hasOwnProperty('associatedCampaign') && post.associatedCampaign.indexOf(possibleCampaign.id) !== -1) {
              possibleCampaign.researchPosts.push(post)
            }
          }
        }
      })
    }
  })

  return siteData
}

function outputWebpage (html, path) {
  var minifiedHtml = minify(html, {collapseWhitespace: true})
  fsp.outputFile(path, minifiedHtml)
}

function generateFrontPage (siteData, templatesCompiled) {
  if (siteData.site.showOnFront !== 'page') {
    // var frontPage = _.find(siteData.posts, function (o) {
    //   return o.id === siteData.site.pageOnFront
    // })
    //
    // if (frontPage) {
    //   var compiledTemplate = getCompiledTemplate(frontPage, templatesCompiled)
    //   var pageHtml = compiledTemplate({site: siteData, post: frontPage})
    //   var pagePath = path.join(config.sitePath, frontPage.permalink, 'index.html')
    //
    //   outputWebpage(pageHtml, pagePath)
    // }
  } else if (siteData.site.showOnFront === 'posts') {
    // Render the blog page
  }
}

function getCompiledTemplate (post, templatesCompiled) {
  var templatesList = templateLocator(post)
  var availableTemplates = Object.keys(templatesCompiled)
  var templatesThatCouldWork = _.intersection(templatesList, availableTemplates)

  if (templatesThatCouldWork.length < 1) {
    throw new Error('No template available.')
  } else {
    return templatesCompiled[templatesThatCouldWork[0]]
  }
}

function generatePostTypeArchivePages (siteData, templatesCompiled) {
  siteData.postTypeArchives.forEach((postTypeArchive) => {
    let template = getCompiledTemplate(postTypeArchive, templatesCompiled)

    if (template) {
      let posts = siteData.posts.filter((post) => {
        return post.type === postTypeArchive.postType
      })

      var html = template({
        site: siteData,
        posts,
        postTypeArchive
      })

      let pagePath = path.join(config.sitePath, postTypeArchive.path, 'index.html')

      outputWebpage(html, pagePath)
    }
  })
}

function generateSingularPages (siteData, templatesCompiled) {
  siteData.posts.forEach((page) => {
    if (page.id !== siteData.site.page_for_posts) {
      var templateInfo = {}

      if (page.type === 'post' || page.type === 'page') {
        templateInfo = {
          type: page.type,
          slug: page.slug,
          id: page.id
        }
      } else {
        templateInfo = {
          type: 'custom_post_type',
          postType: page.type
        }
      }

      var compiledTemplate = getCompiledTemplate(templateInfo, templatesCompiled)
      var pageHtml = compiledTemplate({site: siteData, post: page})
      var pagePath = path.join(config.sitePath, page.permalink, 'index.html')

      outputWebpage(pageHtml, pagePath)
    }
  })
}

function generateSearchPage (siteData, templatesCompiled) {
  var searchPost = {
    type: 'search'
  }

  var compiledTemplate = getCompiledTemplate(searchPost, templatesCompiled)
  var searchPageHtml = compiledTemplate({site: siteData})
  var searchPath = path.resolve(config.sitePath, 'search', 'index.html')

  outputWebpage(searchPageHtml, searchPath)
}

function generate404Page (siteData, templatesCompiled) {
  var fourOhFourPost = {
    type: '404'
  }

  var compiledTemplate = getCompiledTemplate(fourOhFourPost, templatesCompiled)
  var fourOhFourPageHtml = compiledTemplate({site: siteData})
  var fourOhFourPath = path.resolve(config.sitePath, '404.html')

  outputWebpage(fourOhFourPageHtml, fourOhFourPath)
}

function generateTaxonomyTermPages (siteData, templatesCompiled) {
  siteData.terms.forEach(term => {
    let posts = siteData.posts.filter(post => {
      return post.taxonomyTermIds.indexOf(term.id) !== -1
    })

    let locals = {
      term,
      isTaxonomyTermArchive: true,
      posts,
      site: siteData
    }

    let templatePage = {
      taxonomy: term.taxonomy,
      term,
      type: 'taxonomy_term_archive'
    }

    let compiledTemplate = getCompiledTemplate(templatePage, templatesCompiled)
    let html = compiledTemplate(locals)
    let pagePath = path.join(config.sitePath, term.permalink, 'index.html')

    outputWebpage(html, pagePath)
  })
}

function generate () {
  var siteDownloaded = axios(config.endpoint)
    .then(
      (response) => {
        return fsp.outputJson('site.json', response.data)
      }, (err) => {
        throw err
      }
    )

  siteDownloaded.then(() => {
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
        var siteData = values[0]// values[0].data;
        var templates = values[1]
        var templatesCompiled = {}

        siteData = replaceMediaReferences(siteData)

        mediaDownloader(siteData.media)

        // Normalize the data
        siteData = normalizeSiteData(siteData)

        // Compile all the available pug templates (synchronously)
        templates.forEach(function (templateFile) {
          if (path.extname(templateFile) === '.pug') {
            templatesCompiled[templateFile] = pug.compileFile(path.join(config.templatesPath, templateFile))
          }
        })

        generateFrontPage(siteData, templatesCompiled)
        generateSingularPages(siteData, templatesCompiled)
        generatePostTypeArchivePages(siteData, templatesCompiled)
        generateTaxonomyTermPages(siteData, templatesCompiled)

        // These are special pages
        generate404Page(siteData, templatesCompiled)
        generateSearchPage(siteData, templatesCompiled)
      })
  })
}

(function () {
  module.exports = generate

  if (!module.parent) {
    generate()
  }
})()
