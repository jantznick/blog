let cache_name = 'mexico-v5'

let urls_to_cache = [
	'/mexico',
	'/mexico/',
	'/css/index.css'
]

self.addEventListener('install', (e) => {
	e.waitUntil(caches.open(cache_name).then((cache) => {
		return cache.addAll(urls_to_cache)
	}))
})

self.addEventListener('fetch', (e) => {
	e.respondWith(caches.match(e.request).then((response) => {
		if (response)
			return response
		else
			return fetch(e.request)
	}))
})