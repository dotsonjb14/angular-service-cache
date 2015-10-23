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
        return function() {
            var _cache = {};

            return {
                get: _get,
                put: _put,
                remove: _remove,
                removeAll: _removeAll
            };

            function _get(key) {
                return _cache[key];
            }

            function _put(key, val, ttl) {
                _cache[key] = val;
                if(typeof  ttl === 'undefined') {
                    ttl = 0;
                }
                if(ttl > 0) {
                    setTimeout(function () {
                        _remove(key)
                    }, ttl)
                }
                return this;
            }

            function _remove(key) {
                delete _cache[key];
                return this;
            }

            function _removeAll() {
                _cache = {}; // reset it
            }
        }
    }

    serviceCache.$inject = ["mCache", "$q"];
    function serviceCache (mCache, $q) {
        var cache = mCache();

        return {
            run: _run,

            // these are proxies for the cache backend
            put: _put,
            get: _get,
            remove: _remove
        };

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
    }
})();