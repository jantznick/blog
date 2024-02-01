if ('serviceWorker' in navigator) {
	console.log('serviceworker')
	console.log(window)
	console.log(Object.keys(window))
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/sw.js').then((registration) => {
			console.log("Service Worker registration successful: ")
			console.log(registration)
		}, (err) => {
			console.log("Registration failed")
			console.log(err)
			console.log(window)
		})
	})
}