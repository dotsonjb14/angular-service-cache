(function () {
    angular.module('service-cache', [])
        .factory('serviceCache', serviceCache);

    serviceCache.$inject = ["$cacheFactory", "$q"];
    function serviceCache ($cacheFactory, $q) {
        var cache = $cacheFactory("service-cache");
        return {
            run: _run,
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
            cache.put(key, val);
            if(typeof  ttl === 'undefined') {
                ttl = 0;
            }
            if(ttl > 0) {
                setTimeout(function () {
                    _remove(key)
                }, ttl)
            }
        }

        function _remove(key) {
            cache.remove(key);
        }
    }
})();