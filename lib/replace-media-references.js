const path = require('path')
const urljoin = require('url-join')
const replaceall = require('replaceall')

function replaceMediaReferences (siteData) {
  let newSiteData = JSON.stringify(siteData)

  let urlBase = siteData.media.upload_uri.baseurl
  let images = siteData.media.images
  let imageURLs = []

  images.forEach((image) => {
    let uploadsDirSubPath = path.parse(image.file).dir
    imageURLs.push({
      url: urljoin(urlBase, image.file)
    })

    Object.keys(image.sizes).forEach(sizeKey => {
      // let url = urljoin(urljoin(urlBase, uploadsDirSubPath), image.sizes[sizeKey].file)
      imageURLs.push({
        url: urljoin(urlBase, uploadsDirSubPath, image.sizes[sizeKey].file)
      })
    })
  })

  imageURLs.forEach(img => {
    let newURL = img.url.replace(siteData.media.upload_uri.baseurl, '')
    newSiteData = replaceall(img.url, newURL, newSiteData)
  })

  return JSON.parse(newSiteData)
}

module.exports = replaceMediaReferences
