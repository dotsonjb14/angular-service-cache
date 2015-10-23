(function () {
    angular.module('service-cache', [])
        .factory('serviceCache', serviceCache());

    serviceCache.$inject = ["$cacheFactory", "$q"]
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
                        cache.put(key, data);
                        if(ttl > 0) {
                            setTimeout(function () {
                                cache.remove(key)
                            }, ttl)
                        }
                        return data;
                    });
            }
        }

        function _remove(key) {
            cache.remove(key);
        }
    }
})();