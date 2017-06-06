const path = require('path')
const urljoin = require('url-join')

function replaceMediaReferences (siteData) {
  let newSiteData = JSON.stringify(siteData)
  let media = siteData.media
  // https://recruiter-phyllis-23563.netlify.com

  let urlBase = media.upload_uri.url
  let images = media.images
  let imageURLs = []

  images.forEach((image) => {
    let uploadsDirSubPath = path.parse(image.file).dir

    imageURLs.push({
      url: urljoin(urlBase, image.file),
      subPath: uploadsDirSubPath
    })

    Object.keys(image.sizes).forEach(sizeKey => {
      imageURLs.push({
        url: urljoin(urljoin(urlBase, uploadsDirSubPath), image.sizes[sizeKey].file),
        subPath: uploadsDirSubPath
      })
    })
  })

  imageURLs.forEach(img => {
    let newURL = img.url.replace(media.upload_uri.url, '')
    newSiteData = newSiteData.replace(img.url, newURL)
  })

  return JSON.parse(newSiteData)
}

module.exports = replaceMediaReferences
