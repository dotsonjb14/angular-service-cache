// load the module for ALL tests
beforeEach(module('service-cache'));

// generic cache testss. Should be run for each implementation or proxy
function cacheTests() {
    it("Test put and get", function () {
        var data = 'asd2d3h1 2uk d';

        this.cache.put('testData', data);

        this.cache.get('testData').should.be.exactly(data);
    });

    it("Test remove", function () {
        var data = 'asd2d3h1 2uk d';
        this.cache.put('testData', data);
        this.cache.get('testData').should.be.exactly(data);

        this.cache.remove('testData');

        Should(this.cache.get('testData')).be.undefined();
    });
    it("Chain put calls", function () {
        this.cache
            .put('test1', 'a')
            .put('test2', 'b');

        Should(this.cache.get("test1")).eql("a");
        Should(this.cache.get("test2")).eql("b");
    });
    it("Chain remove calls", function () {
        this.cache
            .put('test1', 'a')
            .put('test2', 'b');

        this.cache
            .remove('test1')
            .remove('test2');

        this.cache.all().should.eql({});
    });

    it("Test removeAll", function () {
        this.cache.put('TestData-1', 'asdasasd');
        this.cache.put('TestData-2', 'asdasasd');
        this.cache.put('TestItem-1', 'asdasasd');

        this.cache.removeAll();
        this.cache.all().should.eql({});
    });

    it("Test remove by regex", function () {
        this.cache.put('TestData-1', 'asdasasd');
        this.cache.put('TestData-2', 'asdasasd');
        this.cache.put('TestItem-1', 'asdasasd');

        this.cache.remove(/TestData/);
        this.cache.all().should.not.have.properties(["TestData-1", "TestData-2"])
    });
}

describe("mCache Tests", function () {
    var mCache = null;

    beforeEach(inject(function (_mCache_) {
        mCache = _mCache_
    }));

    it("inject mCache", function () {
        mCache.should.not.be.undefined()
    });

    it("mCache should expose all it's functions", function () {
        var cache = mCache();
        cache.should.not.be.null();
        cache.should.have.properties(['put', 'get', 'all', 'remove', 'removeAll']);
    });

    describe("Main Tests", function () {
        var cache = null;

        beforeEach(function () {
            cache = mCache();
            cache.__killAll();

            this.cache = cache; // for shared tests
        });

        it("Initializing cache", function () {
            cache.should.not.be.null();
        });

        it("Initial cache should be empty", function () {
            cache.all().should.be.eql({});
        });

        cacheTests();

        describe("Test TTL", function () {
            it("Add item to cache with ttl", function () {
                var data = 'fwfaf';
                cache.put('testData', data, 300);
                cache.get('testData').should.be.exactly(data);
            });

            it("Make sure item is removed", function (done) {
                var data = 'fwfaf';
                cache.put('testData', data, 300);
                cache.get('testData').should.be.exactly(data);
                setTimeout(function () {
                    debugger;
                    Should(cache.get('testData')).be.undefined();
                    done();
                }, 320);
            });
        });

        describe("Test Global Cache", function () {
            it("Test Seperate cache's don't collide", function () {
                var c1 = mCache("cache1");
                var c2 = mCache("cache2");

                c1.put("testData", "data");
                c2.put("testData", "new data");

                c1.get("testData").should.eql("data");
                c2.get("testData").should.eql("new data");
            });

            it("Two instances of the same cache should hold the same data", function () {
                var data = "my test data";

                var c1 = mCache("cache1");
                var c2 = mCache({
                    name: "cache1"
                });

                c1.put("testData", data);

                Should(c2.get("testData")).eql(data);
            });

            it("Test __killAll function", function () {
                var c1 = mCache("cache");
                c1.__killAll();
                var c2 = mCache("cache");

                c1.put("testData", "data");
                Should(c2.get("testDAta")).be.undefined();
            });

            it("Test local storage persistance", function (done) {
                var c1 = mCache({
                    name: "cache",
                    persistLocal: true
                });
                c1.put("testData", "my data", 300);

                var tempObj = {
                    name:"cache",
                    persistLocal: true,
                    cache: {
                        testData: "my data"
                    }
                };

                Should(JSON.parse(localStorage.getItem("cache-cache"))).propertyByPath(["cache", "testData", "val"]).eql("my data")

                c1.__killAll();

                var c2 = mCache({
                    name: "cache",
                    persistLocal: true
                });

                Should(c2.get("testData")).be.eql("my data");

                setTimeout(function () {
                    done()
                    Should(c2.get("testData")).be.undefined();
                }, 320);
            })
        })
    })
});

describe("serviceCache Tests", function () {
    var serviceCache = null;

    beforeEach(inject(function (_serviceCache_) {
        serviceCache = _serviceCache_;

        this.cache = serviceCache;
    }));

    it("inject serviceCache", function () {
        serviceCache.should.not.be.undefined()
    });

    describe("Main Tests", function () {
        it("Initial cache should be empty", function () {
            serviceCache.all().should.eql({});
        });

        describe("Injecting custom backend", function () {
            beforeEach(function () {
                var _cache = {};

                serviceCache.injectCache({
                    get: _get,
                    put: _put,
                    remove: _remove,
                    removeAll: _removeAll,
                    all: _all
                });

                function _get(key) {
                    return _cache[key];
                }

                function _put(key, value) {
                    _cache[key] = value;
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
                }

                function _removeAll() {
                    _cache = {};
                }

                function _all() {
                    return _cache;
                }
            });

            cacheTests();
        });

        describe("Test cache proxies", function () {
            cacheTests();
        });

        describe("Test serviceCache run", function () {
            var $http = null;
            var httpBackend = null;
            var $q = null;
            var $rootScope = null;

            beforeEach(inject(function (_$http_, $httpBackend, _$q_, _$rootScope_) {
                $http = _$http_;
                httpBackend = $httpBackend;
                $q = _$q_;
                $rootScope = _$rootScope_;

                httpBackend.when("GET", 'testData.json')
                    .respond({response: 'test'});

                httpBackend.when("GET", 'currentDate.json')
                    .respond(function (method, url, data, headers, params) {
                        return [200, {response: new Date()}]
                    });

                httpBackend.when("GET", 'currentDate2.json')
                    .respond(function (method, url, data, headers, params) {
                        return [200, {response: new Date()}]
                    });
            }));

            afterEach(function () {
                httpBackend.verifyNoOutstandingExpectation();
                httpBackend.verifyNoOutstandingRequest();
            });

            it("test http injection", function (done) {
                $http.get('testData.json')
                    .then(function (response) {
                        response.data.should.eql({response: 'test'});
                        done();
                    }, function (err) {
                        done(err);
                    });

                httpBackend.flush();
            });

            function runWithoutTTL() {
                return serviceCache.run(function () {
                    return $http.get('currentDate.json')
                        .then(function (response) {
                            return response.data;
                        }, function (err) {
                            done(err);
                        });
                }, 'testData');
            }

            function runWithTTL(url) {
                url = url || 'currentDate.json';
                return serviceCache.run(function () {
                    return $http.get(url)
                        .then(function (response) {
                            return response.data;
                        }, function (err) {
                            done(err);
                        });
                }, 'testData', 300);
            }

            it("Test without TTL", function (done) {
                var p = runWithoutTTL();

                $q.when(p).then(function (data) {
                    data.should.not.be.null();

                    serviceCache.get('testData').should.be.exactly(data);
                    done()
                });

                httpBackend.flush();
            });

            it("Test with TTL", function (done) {
                this.timeout = 5000;
                var
                    a = null,
                    b = null,
                    c = null;

                $q
                    .when(true)
                    .then(runA)
                    .then(runB)
                    .then(runC)
                    .then(function (d) {
                        a.should.eql(b);
                        b.should.not.eql(c);
                        done();
                    });

                httpBackend.flush();

                function runA() {
                    return runWithTTL()
                        .then(function (data) {
                            a = data;
                        });
                }

                function runB() {
                    return runWithTTL()
                        .then(function (data) {
                            b = data;
                        });
                }

                function runC() {
                    var defer = $q.defer();
                    setTimeout(function () {
                        runWithTTL('currentDate2.json')
                            .then(function (data) {
                                c = data;
                                defer.resolve(data);
                            });

                        httpBackend.flush();

                    }, 320);

                    return defer.promise;
                }
            });

            it("Return Non-Promise", function (done) {
                var data = 'asd';
                serviceCache.run(function () {
                    return data;
                }, 'testData').then(function (d) {
                    data.should.be.exactly(d);
                    serviceCache.get('testData').should.be.exactly(data);
                    done();
                });

                $rootScope.$digest();
            });

            it("Return Promise", function (done) {
                var data = 'asd';
                serviceCache.run(function () {
                    return $q.when(data);
                }, 'testData').then(function (d) {
                    data.should.be.exactly(d);
                    serviceCache.get('testData').should.be.exactly(data);
                    done();
                });

                $rootScope.$digest();
            });


        })
    });
});