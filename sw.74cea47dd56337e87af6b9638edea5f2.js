/* eslint no-var: off */
/* eslint no-console: off */
/* global fetch createImageBitmap self caches importScripts Response clients*/

importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.6.1/workbox-sw.js")

var supportsWebp = false

function fetchOptimized(event, url) {
  var matches = (url.protocol + "//" + url.host + url.pathname).match(
    /^(https?:\/\/[^/]+\/res\/[\da-z]+\/[\da-f]{24}_optimized)(?:[^./]+)(\..+)?$/
  )
  if (!matches) return fetch(event.request.clone())

  return fetch(url.protocol + "//" + url.host + url.pathname + url.search, {redirect: 'follow'})
    .catch(function() {return {status: 404}})
    .then(function(resp) {
      var ext = matches[2] || ''
      if (resp.status == 404 || resp.status == 403) return fetch(matches[1] + ext, {redirect: 'follow'})
      return resp
    })
}

function processResource(arg) {
  var url = arg.url
  var event = arg.event
  var hasQuery = event.request.url.indexOf('?') != -1
  if (event.request.method != "GET" || url.pathname.match(/\.webp$/)) {
    return
  }
  if (!supportsWebp) {
    event.respondWith(fetchOptimized(event, url))
  } else {
    event.respondWith(caches.open("webp-cache").then(function(cache) {
      return cache.match(event.request, {ignoreSearch: hasQuery}).then(function(result) {
        if (result && result.ok) return result
        var init = {method: "GET", cache: "default", redirect: 'follow'}
        return fetch(url.protocol + "//" + url.host + url.pathname + ".webp" + url.search, init)
          .catch(function() {return {status: 666}})
          .then(function(resp) {
            if (resp.status == 200) return cache.put(event.request, resp.clone()).then(function() {return resp})
            if (resp.status == 404) {
              var arr = url.host.split(".")
              arr[0] = "api"
              arr[2] = arr[2].replace("site", "com").replace("xyz", "co")
              var ref = encodeURIComponent(url.pathname.slice(1))
              fetch(
                url.protocol + "//" + arr.join(".") + "/api/resource/webp/check?ref=" + ref,
                {method: "POST", redirect: 'follow'}
              ).catch(console.error)
            }
            return fetchOptimized(event, url)
          })
      })
    }))
  }
}

var matchWebp = /^https?:\/\/[^/]+\/res\/[\da-z]+\/[\da-f]{24}[^/]*$/
var workbox = this.workbox

if (!workbox) {
  // console.log(`Boo! Workbox didn't load 😬`);
  self.addEventListener("fetch", function onFetch(event) {
    var url = new URL(event.request.url)
    if (!(url.protocol + "//" + url.host + url.pathname).match(matchWebp)) return
    return processResource({url: url, event: event})
  })
} else {
  function loadFont(args) {
    var url = args.url
    var event = args.event
    var hasQuery = event.request.url.indexOf('?') != -1
    event.respondWith(caches.open("google-fonts-stylesheets").then(function(cache) {
      return cache.match(event.request, {ignoreSearch: hasQuery}).then(function(cacheResponse) {
        if (cacheResponse) {
          if (+new Date(cacheResponse.headers.get("date")) + 24 * 3600000 > Date.now()) {
            return cacheResponse
          }
          cache.delete(event.request)
        }
        return fetch(url).then(function(response) {
          if (response.status >= 400) return response
          return response.text().then(function(css) {
            // var patched = css.replace(/(@font-face\s*\{)/g, "$1\n  font-display: swap;")
            var patched = css
            var init = {
              status: response.status, statusText: response.statusText,
              headers: {date: new Date().toUTCString()}
            }
            response.headers.forEach(function(v, k) {init.headers[k] = v})
            var newResponse = new Response(patched, init)
            return cache.put(event.request, newResponse.clone()).then(function() {return newResponse})
          })
        })
      })
    }))
  }

  // console.log(`Yay! Workbox is loaded 🎉`);
  // workbox.navigationPreload.enable()
  // workbox.routing.registerRoute(/^https:\/\/fonts\.googleapis\.com\/css/, loadFont)
  // workbox.routing.registerRoute(
  //   /^https:\/\/fonts\.gstatic\.com/,
  //   workbox.strategies.cacheFirst({
  //     cacheName: "google-fonts-webfonts",
  //     plugins: [
  //       new workbox.cacheableResponse.Plugin({statuses: [0, 200]}),
  //       new workbox.expiration.Plugin({maxAgeSeconds: 60 * 60 * 24 * 365, maxEntries: 30}),
  //     ],
  //   })
  // )
  workbox.routing.registerRoute(matchWebp, processResource)

  // workbox.routing.registerRoute(
  //   new RegExp('\\.woff$'),
  //   workbox.strategies.cacheFirst({
  //     cacheName: "custom-fonts",
  //     plugins: [
  //       new workbox.cacheableResponse.Plugin({statuses: [0, 200]}),
  //       new workbox.expiration.Plugin({maxAgeSeconds: 60 * 60 * 24 * 365, maxEntries: 30}),
  //     ],
  //   })
  // )
}

self.addEventListener("install", function(event) {
  if (!this.createImageBitmap) {
    return event.waitUntil(self.skipWaiting())
  }
  var webpData = "data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA="
  event.waitUntil(
    fetch(webpData).then(function(r) {
      return r.blob()
    }).then(function(blob) {
      return createImageBitmap(blob).then(function() {
        supportsWebp = true
      })
    }).catch(function() {}).then(function() {self.skipWaiting()}))
})

self.addEventListener("activate", function() {
  clients.claim().then(function() {
    clients.matchAll().then(function(clients) {
      clients.forEach(function(client) {
        client.postMessage("active")
      })
    })
  })
})

