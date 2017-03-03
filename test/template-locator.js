/* eslint-env node, mocha */

const templateLocator = require('../lib/template-locator')
const expect = require('chai').expect

const expectedTemplates = [
  {
    input: {type: 'post', id: 0, slug: 'test-post'},
    expected: ['single-post.pug', 'single.pug', 'singular.pug', 'index.pug']
  },
  {
    input: {type: 'page', id: 10, slug: 'this-is-page-slug'},
    expected: ['page-this-is-page-slug.pug', 'page-10.pug', 'page.pug', 'singular.pug', 'index.pug']
  },
  {
    input: {type: 'search'},
    expected: ['search.pug', 'index.pug']
  },
  {
    input: {type: '404'},
    expected: ['404.pug', 'index.pug']
  },
  {
    input: {type: 'post_type_archive', postType: 'custom-post-type'},
    expected: ['archive-custom-post-type.pug', 'archive.pug', 'index.pug']
  }
]

describe('TemplateLocator', () => {
  describe('Locates templates for various page types', () => {
    expectedTemplates.forEach((element, index) => {
      it('Should match expected results for test input type: ' + element.input.type, () => {
        var result = templateLocator(element.input)

        expect(result).to.deep.equal(element.expected)
      })
    })
  })
})
