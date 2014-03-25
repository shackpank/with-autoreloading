With Autoreloading
==================

Require a magically self-reloading module. Useful if you want to try out exploratory changes in the REPL to code already in a file on disk.

```javascript
// test.js
module.exports = function() {
  return 'old';
};

// REPL
> var test = require('with-autoreloading')('./test');
> test();
'old'

// test.js, edited and saved
module.exports = function() {
  return 'new';
}

// same REPL
> test();
'new'
```

##### So how far did you go with this

```javascript
// numbers.js
module.exports = {
  numbers: [ 1, 2, 3 ],
  multiply: function() {
    return this.numbers.map(function(num) {
      return num * 2;
    })
  }
}

// REPL
> var numbers = require('with-autoreloading')('./numbers')
> numbers.numbers
[ 1, 2, 3 ]
> numbers.multiply()
[ 2, 4, 6 ]

// numbers.js, edited & saved
module.exports = {
  numbers: [ 4, 5 ],
  multiply: function() {
    return this.numbers.map(function(num) {
      return num * 3;
    })
  }
}

// same REPL
> numbers.numbers
[ 4, 5 ]
> numbers.multiply()
[ 9, 15 ]
```

##### OK cool. Tell me more.

```javascript
// car.js
function Car() {};

Car.prototype.wheels = 4;

Car.prototype.replaceTires = function() {
  if(this.wheels != 4) console.error('that\'s a weird number of wheels...');
  return this.wheels + ' tires replaced!';
};

module.exports = Car;

// REPL
> var Car = require('with-autoreloading')('./car');
> var myCar = new Car();
> myCar.replaceTires();
'4 tires replaced!'

// edited car.js
(snip)
Car.prototype.wheels = 6;
(snip)

// same REPL
> myCar.replaceTires()
that's a weird number of wheels...
'6 tires replaced!'
```

##### No friggin way

Yeah seriously.

So how does it do that
----------------------

A middleman proxy object/function. When you save the file, it clears the require cache for that file, requires it again, and has the proxy call through to the new code.

Could I use this in production?
-------------------------------

Please don't. Use like, supervisor or nodemon or something more like that. This is aimed at the REPL, and even there I'm not convinced it's 100% stable/correct (but useful enough despite that).

Tests
-----

`npm test`