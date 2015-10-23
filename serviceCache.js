(function () {
    angular.module('service-cache', [])
        .factory('serviceCache', serviceCache);

    serviceCache.$inject = ["$cacheFactory", "$q"];
    function serviceCache ($cacheFactory, $q) {
        var cache = $cacheFactory("service-cache");
        return {
            run: _run,
            remove: _remove
        };

        function _run(func, key, ttl) {
            var val = cache.get(key);
            if(typeof  ttl === 'undefined') {
                ttl = 0;
            }

            if (typeof val !== 'undefined') {
                return $q.when(val);
            }
            else {
                return $q.when(func())
                    .then(function (data) {
                        _put(key, data);
                        if(ttl > 0) {
                            setTimeout(function () {
                                _remove(key)
                            }, ttl)
                        }
                        return data;
                    });
            }
        }

        function _put(key, val) {
            cache.put(key, val);
        }

        function _remove(key) {
            cache.remove(key);
        }
    }
})();