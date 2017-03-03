var templateLocator = require('../lib/template-locator');
var expect = require('chai').expect;

var expectedTemplates = [
  {
    input: {postType: 'post', id: 0, slug: 'test-post'},
    expected: ['index', 'singular', 'single', 'single-post']
  },
  {
    input: {postType: 'page', id: 10, slug: 'this-is-page-slug'},
    expected: ['index', 'singular', 'page', 'page-10', 'page-this-is-page-slug']
  }
];

describe('TemplateLocator', function(){
  describe('Expectations', function(){
    expectedTemplates.forEach(function(element){
      it('Should match expected results', function(){
        var result = templateLocator(element.input.postType, element.input.id, element.input.slug)

        expect(result).to.deep.equal(element.expected)
      })
    })
  })
})
