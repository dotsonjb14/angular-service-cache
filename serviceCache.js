(function () {
    angular.module('service-cache', [])
        .factory('serviceCache', function ($cacheFactory, $q) {
            var cache = $cacheFactory("service-cache");
            return {
                run: _run,
                remove: _remove
            };

            function _run(func, key) {
                var val = cache.get(key);

                if (typeof val !== 'undefined') {
                    return $q.when(val);
                }
                else {
                    return $q.when(func())
                        .then(function (data) {
                            cache.put(key, data);
                            return data;
                        });
                }
            }

            function _remove(key) {
                cache.remove(key);
            }
        });
})();