var assert = require('assert');
var fs = require('fs');

describe('autoreloading', function() {
  before(function() {
    try {
      fs.mkdirSync('./testTmp');
    } catch(e) { }
  });

  after(function() {
    try {
      fs.rmdirSync('./testTmp');
    } catch(e) { }
  });

  describe('when a function is exported', function() {
    afterEach(function() {
      try {
        fs.unlinkSync('./testTmp/fn.js');
      } catch(e) { }
    });

    it('autoreloads the function', function() {
      fs.writeFileSync('./testTmp/fn.js', 'module.exports = function() { return "hello world" }');

      var fn = require('../')('./testTmp/fn.js');

      assert.equal(fn(), 'hello world');

      fs.writeFileSync('./testTmp/fn.js', 'module.exports = function() { return "hello sun" }');

      setTimeout(function() {
        assert.equal(fn(), 'hello sun');
        done();
      }, 10);
    });
  });

  describe('when an object is exported', function() {
    afterEach(function() {
      try {
        fs.unlinkSync('./testTmp/obj.js');
      } catch(e) { }
    });

    it('autoreloads all properties of the object', function() {
      fs.writeFileSync('./testTmp/obj.js', 'module.exports = { foo: function() { return "bar"; }, bar: 123 }');

      var obj = require('../')('./testTmp/obj.js');

      assert.equal(obj.foo(), 'bar');
      assert.equal(obj.bar, 123);

      fs.writeFileSync('./testTmp/obj.js', 'module.exports = { foo: function() { return "baz"; }, bar: 456 }');

      setTimeout(function() {
        assert.equal(obj.foo(), 'baz');
        assert.equal(obj.bar, 456);
        done();
      }, 10);
    });
  });

  describe('when a constructor is exported', function() {
    afterEach(function() {
      try {
        fs.unlinkSync('./testTmp/cs.js');
      } catch(e) { }
    });

    it('autoreloads, including prototypes of existing instances', function() {
      fs.writeFileSync('./testTmp/cs.js', [
        'function MyFunction() { };',
        'MyFunction.prototype.instanceMethod = function() {',
          'return 3 + this.instanceProperty;',
        '};',
        'MyFunction.prototype.instanceProperty = 4;',
        'MyFunction.classMethod = function() {',
          'return 456;',
        '};',
        'module.exports = MyFunction;'
      ].join(''));

      var Construct = require('../')('./testTmp/cs.js');

      var instance = new Construct();
      assert.equal(instance.instanceMethod(), 7);
      assert.equal(Construct.classMethod(), 456);

      fs.writeFileSync('./testTmp/cs.js', [
        'function MyFunction() { };',
        'MyFunction.prototype.instanceMethod = function() {',
          'return 5 + this.instanceProperty;',
        '};',
        'MyFunction.prototype.instanceProperty = 6;',
        'MyFunction.classMethod = function() {',
          'return 789;',
        '};',
        'module.exports = MyFunction;'
      ].join(''));

      setTimeout(function() {
        assert.equal(Construct.classMethod(), 789);
        assert.equal(instance.instanceMethod(), 11);
        done();
      }, 10);
    });
  });
});
