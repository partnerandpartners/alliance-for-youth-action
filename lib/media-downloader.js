const download = require('download')
const path = require('path')
const urljoin = require('url-join')
const config = require('config')

function downloadMedia (media) {
  let urlBase = media.upload_uri.baseurl
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
    download(img.url, path.join(config.siteFolder, img.subPath))
      .then(data => {
        console.log(img.url + ' done')
      })
      .catch(err => {
        console.log(err)
      })
  })
}

module.exports = downloadMedia
