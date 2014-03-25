module.exports = function reloadingRequire(filename) {
  var proxy = {};

  var rearm = function(mod) {
    for(i in proxy) {
      delete proxy[i];
    }

    for(i in mod) {
      proxy[i] = mod[i];
    }
  };

  rearm(require(filename));

  var path = require.resolve(filename);
  fs.watch(path, function() {
    delete require.cache[path];
    rearm(require(filename));
  });

  return proxy;
};
