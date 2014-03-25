var fs = require('fs');

module.exports = function reloadingRequire(filename) {
  var proxy;
  var rearm;
  var _fnImpl;

  var rearmObject = function(mod) {
    for(i in proxy) {
      delete proxy[i];
    }

    for(i in mod) {
      proxy[i] = mod[i];
    }
  };

  var rearmFunction = function(mod) {
    _fnImpl = mod;

    for(i in proxy.prototype) {
      delete proxy.prototype[i];
    }

    for(i in proxy) {
      delete proxy[i];
    }

    for(i in mod.prototype) {
      proxy.prototype[i] = mod.prototype[i];
    }

    for(i in mod) {
      if(mod.hasOwnProperty(i)) {
        proxy[i] = mod[i];
      }
    }
  };

  var initial = require(filename);

  if(typeof initial === 'function') {
    proxy = function() {
      return _fnImpl.apply(this, arguments);
    };
    rearm = rearmFunction;
  } else {
    proxy = {};
    rearm = rearmObject;
  }

  rearm(initial);

  var path = require.resolve(filename);
  fs.watch(path, function(evtType) {
    if(evtType !== 'change') return;
    delete require.cache[path];
    rearm(require(filename));
  });

  return proxy;
};
