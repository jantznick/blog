if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('sw.js')
			.then((registration) => {
				console.log("Service Worker registration successful")
			}, (err) => {
				console.log("Registration failed")
			})
	})
}

let cache_name = 'mysite-v1'
let urls_to_cache = [
	'/mexico'
]
self.addEventListener('install', (e) => {
	e.waitUntil(caches.open(cache_name).then((cache) => {
		return cache.addAll(urls_to_cache)
	}))
})

self.addEventListener('fetch', (e) => {
    e.respondWith(caches.match(e.request).then((response) => {
     if(response)
      return response
     else
      return fetch(e.request)
    }) )
})