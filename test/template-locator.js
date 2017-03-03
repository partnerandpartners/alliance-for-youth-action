var templateLocator = require('../lib/template-locator');
var expect = require('chai').expect;

var expectedTemplates = [
  {
    input: {type: 'post', id: 0, slug: 'test-post'},
    expected: ['index', 'singular', 'single', 'single-post']
  },
  {
    input: {type: 'page', id: 10, slug: 'this-is-page-slug'},
    expected: ['index', 'singular', 'page', 'page-10', 'page-this-is-page-slug']
  },
  {
    input: {type: 'search'},
    expected: ['index', 'search']
  },
  {
    input: {type: '404'},
    expected: ['index', '404']
  },
  {
    input: {type: 'post_type_archive', post_type_archive_type: 'custom-post-type'},
    expected: ['index', 'archive', 'archive-custom-post-type']
  }
];

describe('TemplateLocator', function(){
  describe('Locates templates for various page types', function(){
    expectedTemplates.forEach(function(element, index){
      it('Should match expected results for test input type: ' + element.input.type, function(){
        var result = templateLocator(element.input)

        expect(result).to.deep.equal(element.expected)
      })
    })
  })
})
