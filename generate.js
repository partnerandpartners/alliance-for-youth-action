const config = require('config')
const pug = require('pug')
const fsp = require('fs-promise')
const path = require('path')
const minify = require('html-minifier').minify
const _ = require('lodash')
const templateLocator = require('./lib/template-locator')

config.templatesPath = path.resolve(__dirname, config.templatesFolder)
config.sitePath = path.resolve(__dirname, config.siteFolder)

function outputWebpage (html, path) {
  var minifiedHtml = minify(html, {collapseWhitespace: true})
  fsp.outputFile(path, minifiedHtml)
}

function generateFrontPage (siteData, templatesCompiled) {
  if (siteData.site.show_on_front === 'page') {
    var frontPage = _.find(siteData.posts, function (o) {
      return o.id === siteData.site.page_on_front
    })

    if (frontPage) {
      writeTemplate({post: frontPage}, templatesCompiled, 'index.pug', siteData)
    }
  } else if (siteData.site.show_on_front === 'posts') {
    // Render the blog page
  }
}

function getCompiledTemplate (post, templatesCompiled) {
  var templatesList = templateLocator(post)
  if (post.slug === 'sitemap') {
    console.log(templatesList)
  }
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
    console.log(postTypeArchive.path)
    var possibleTemplates = templateLocator(postTypeArchive)
    console.log(possibleTemplates)
    // var template = getTemplate()
  })
}

function generateSingularPages (siteData, templatesCompiled) {
  siteData.posts.forEach((page) => {
    if (page.id !== siteData.site.page_for_posts) {
      var compiledTemplate = getCompiledTemplate(page, templatesCompiled)
      var pageHtml = compiledTemplate({site: siteData, page: page})
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

function writeTemplate (data, templatesCompiled, template, siteData) {
  var postTemplate = templatesCompiled[template]
  var postRendered = postTemplate({post: data.post, site: siteData})
  var outputPath = path.join(config.sitePath, data.post.permalink, 'index.html')

  outputWebpage(postRendered, outputPath)
}

function generate () {
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

      // Compile all the available pug templates (synchronously)
      templates.forEach(function (templateFile) {
        if (path.extname(templateFile) === '.pug') {
          templatesCompiled[templateFile] = pug.compileFile(path.join(config.templatesPath, templateFile))
        }
      })

      generateFrontPage(siteData, templatesCompiled)
      generateSingularPages(siteData, templatesCompiled)
      generatePostTypeArchivePages(siteData, templatesCompiled)

      // These are special pages
      generate404Page(siteData, templatesCompiled)
      generateSearchPage(siteData, templatesCompiled)
    })
}

(function () {
  module.exports = generate

  if (!module.parent) {
    generate()
  }
})()
