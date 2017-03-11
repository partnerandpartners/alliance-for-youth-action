/* eslint-env node, mocha */

const templateLocator = require('../lib/template-locator')
const expect = require('chai').expect

const expectedTemplates = [
  {
    input: {type: 'post', id: 0, slug: 'test-post'},
    expected: ['single-post.pug', 'single.pug', 'singular.pug', 'index.pug']
  },
  {
    input: {type: 'custom_post_type', postType: 'custom-post-type-slug'},
    expected: ['single-custom-post-type-slug.pug', 'single.pug', 'singular.pug', 'index.pug']
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
  },
  {
    input: {
      type: 'taxonomy_term_archive',
      taxonomy: 'this-is-the-taxonomy-slug',
      term: {
        slug: 'this-is-the-term-slug'
      }
    },
    expected: [
      'taxonomy-this-is-the-taxonomy-slug-this-is-the-term-slug.pug',
      'taxonomy-this-is-the-taxonomy-slug.pug',
      'taxonomy.pug',
      'index.pug'
    ]
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
