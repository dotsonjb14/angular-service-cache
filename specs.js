// load the module for ALL tests
beforeEach(module('service-cache'));

describe("mCache Tests", function () {
    it("inject mCache", inject(function (mCache) {
        mCache.should.not.be.undefined()
    }));

    it("mCache should expose all it's functions", inject(function (mCache) {
        var cache = mCache();
        cache.should.not.be.null();
        cache.should.have.properties(['put', 'get', 'all', 'remove', 'removeAll']);
    }));

    describe("Main Tests", function () {
        var cache = null;

        it("Initializing cache", inject(function (mCache) {
            cache = mCache();
            cache.should.not.be.null();
        }));

        it("Make sure cache is empty", function () {
            cache.all().should.be.eql({});
        });

        it("Add item to cache", function () {
            var data = 'asd2d3h1 2uk d';

            cache.put('testData', data);

            cache.get('testData').should.be.exactly(data);
        });

        it("Remove item from cache", function () {
            cache.remove('testData');

            Should(cache.get('testData')).be.undefined();
        });

        it("Add item to cache with ttl", function () {
            var data = 'fwfaf';
            cache.put('testData', data, 300);
            cache.get('testData').should.be.exactly(data);
        });

        it("Make sure item is removed", function (done) {
            setTimeout(function () {
                Should(cache.get('data')).be.undefined();
                done();
            }, 320);
        });
    })
});

describe("serviceCache Tests", function () {
    it("inject serviceCache", inject(function (serviceCache) {
        serviceCache.should.not.be.undefined()
    }))
});

describe("Basic", function () {
    it("true should be true", function () {
        (true).should.be.exactly(true)
    })
});