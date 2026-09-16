document.addEventListener("DOMContentLoaded", function () {
	const inlineCarousels = document.querySelectorAll(".inline-carousel");

	if (inlineCarousels.length === 0) return;

	if (typeof Glide === "undefined") {
		console.error("Glide library is not loaded. Cannot initialize inline carousels.");
		return;
	}

	const instances = [];

	inlineCarousels.forEach((carouselElement) => {
		const carouselId = carouselElement.id;
		const optionsString = carouselElement.dataset.glideOptions;
		let options = {};

		if (!carouselId) {
			console.warn("Inline carousel found without an ID. Skipping initialization.", carouselElement);
			return;
		}

		try {
			options = optionsString ? JSON.parse(optionsString) : {};
		} catch (e) {
			console.error(`Error parsing Glide options for carousel ID ${carouselId}:`, e, optionsString);
			options = {};
		}

		const glideInstance = new Glide(carouselElement, {
			...options,
			// Real click-drag / touch-swipe only (not hover / trackpad pan of a scroll container)
			dragThreshold: 60,
			swipeThreshold: 40,
		});

		glideInstance.mount();
		carouselElement.__inlineGlideInstance = glideInstance;
		instances.push(glideInstance);

		// Inline video: play/pause without opening the lightbox.
		carouselElement.querySelectorAll(".video-play-button").forEach((btn) => {
			btn.addEventListener("click", (e) => {
				e.preventDefault();
				e.stopPropagation();
				const wrapper = btn.closest(".lightbox-image-wrapper");
				const video = wrapper && wrapper.querySelector("video");
				if (!video) return;
				if (video.paused) {
					video.play().catch(() => {});
					btn.classList.add("is-playing");
				} else {
					video.pause();
					btn.classList.remove("is-playing");
				}
			});
		});

		carouselElement.querySelectorAll("video").forEach((video) => {
			video.addEventListener("play", () => {
				const btn = video.closest(".lightbox-image-wrapper")?.querySelector(".video-play-button");
				if (btn) btn.classList.add("is-playing");
			});
			video.addEventListener("pause", () => {
				const btn = video.closest(".lightbox-image-wrapper")?.querySelector(".video-play-button");
				if (btn) btn.classList.remove("is-playing");
			});
		});
	});

	window.__inlineCarouselInstances = instances;

	// Keep Glide sized correctly after orientation / soft keyboard changes.
	let resizeTimer;
	window.addEventListener("resize", () => {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(() => {
			instances.forEach((instance) => {
				if (instance && typeof instance.update === "function") instance.update();
			});
		}, 150);
	});
});
