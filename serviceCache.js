/**
 * This module is used for cacheing services and the like.
 *
 * The reason I am not using $cacheFactory is because you cannot get a list of keys from there.
 */
(function () {
    angular.module('service-cache', [])
        .factory('mCache', mCache)
        .factory('serviceCache', serviceCache);

    function mCache() {
        var globalCache = {};

        return function(ident) {
            var _cache = {};
            var _settings = {};

            initialize();

            return {
                get: _get,
                put: _put,
                remove: _remove,
                removeAll: _removeAll,
                __killAll: __killAll,
                __getGlobal: __getGlobal,
                all: _all
            };

            function initialize() {
                var firstLoad = true;
                if(typeof ident !== "undefined") {
                    var name = "";
                    if(typeof ident === "string") {
                        name = ident;
                    }
                    else {
                        name = ident.name;
                    }

                    if(typeof globalCache[name] !== "undefined") {
                        firstLoad = false;
                        _settings = globalCache[name];
                        _cache = _settings.cache;
                    }
                    else {
                        _settings = {
                            cache: _cache,
                            name: name
                        };

                        if(typeof ident === "object") {
                            _settings.persistLocal = ident.persistLocal || false;
                        }

                        globalCache[name] = _settings;
                    }
                }

                if(firstLoad && _settings.name !== "" && _settings.persistLocal === true) {
                    var obj = localStorage.getItem("cache-" + _settings.name);

                    if(obj !== null) {
                        // we got a hit!
                        _settings = JSON.parse(obj);
                        _cache = _settings.cache;

                        globalCache[_settings.name] = _settings;
                    }
                }
            }

            function _all() {
                return _cache;
            }

            function _get(key) {
                var val = _cache[key];
                if(typeof val !== "undefined") {
                    if(val.expires != null && (new Date()).getTime() > val.expires) {
                        delete _cache[key];
                        return undefined;
                    }

                    return val.val;
                }
                else {
                    return val;
                }
            }

            function _put(key, val, ttl) {
                if(typeof  ttl === 'undefined') {
                    ttl = null;
                }
                else {
                    ttl = (new Date()).getTime() + ttl;
                }
                _cache[key] = {
                    val: val,
                    expires: ttl
                };
                if(_settings.persistLocal || false) {
                    _persistLocal();
                }

                return this;
            }

            function _remove(key) {
                if(key instanceof RegExp) {
                    for(var k in _cache) {
                        if(key.test(k)) {
                            delete _cache[k];
                        }
                    }

                }
                else {
                    delete _cache[key];
                }

                if(_settings.persistLocal || false) {
                    _persistLocal();
                }

                return this;
            }

            function _removeAll() {
                _cache = {}; // reset it
            }

            function __killAll() {
                globalCache = {};
            }

            function __getGlobal() {
                return globalCache;
            }

            function _persistLocal() {
                localStorage.setItem("cache-" + _settings.name, JSON.stringify(_settings));
            }
        }
    }

    serviceCache.$inject = ["mCache", "$q"];
    function serviceCache (mCache, $q) {
        var cache = mCache();

        return {
            run: _run,
            injectCache: _injectCache,

            // these are proxies for the cache backend
            put: _put,
            get: _get,
            remove: _remove,
            removeAll: _removeAll,
            all: _all

        };

        function _injectCache(c) {
            cache = c;
        }

        function _run(func, key, ttl) {
            var val = _get(key);

            if (typeof val !== 'undefined') {
                return $q.when(val);
            }
            else {
                return $q.when(func())
                    .then(function (data) {
                        _put(key, data, ttl);

                        return data;
                    });
            }
        }

        function _get(key) {
            return cache.get(key)
        }

        function _put(key, val, ttl) {
            cache.put(key, val, ttl);
            return this;
        }

        function _remove(key) {
            cache.remove(key);
            return this;
        }

        function _removeAll() {
            cache.removeAll();
        }

        function _all() {
            return cache.all();
        }
    }
})();