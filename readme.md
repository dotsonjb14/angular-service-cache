# serviceCache

serviceCache is a library for caching the results from services, as well as a generic cache library.

Installation can done with bower `bower install angular-service-cache` and then the js file added to your index.
either manually for with a task.

Tests can be run via mocha with `gulp serve-tests` after an npm install.

The test website is located at localhost:8080/mocha.html once the service is running.

## roadmap

* global cache list (done)
  Initializing a cache with an identifier should mean that the cache should be able to be re-used
  on a different page as long as you use the same identifier.
* local storage persistance (done)
  If a specific flag is set, persist changes to the cache to local storage. that way the cache survives a page reload