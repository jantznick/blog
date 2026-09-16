/**
 * Swiper carousels for travel photo albums.
 */
document.addEventListener("DOMContentLoaded", function () {
	const carousels = document.querySelectorAll(".inline-carousel.swiper");
	if (!carousels.length) return;

	if (typeof Swiper === "undefined") {
		console.error("Swiper is not loaded.");
		return;
	}

	carousels.forEach((el) => {
		// eslint-disable-next-line no-new
		new Swiper(el, {
			slidesPerView: 1.15,
			spaceBetween: 12,
			centeredSlides: true,
			centeredSlidesBounds: true,
			grabCursor: true,
			speed: 350,
			threshold: 10,
			touchAngle: 25,
			resistanceRatio: 0.65,
			watchOverflow: true,
			// Must be false so PhotoSwipe can receive clicks on <a.carousel-zoom-link>
			preventClicks: false,
			preventClicksPropagation: false,
			// Trackpad / mouse wheel: horizontal only (vertical page scroll still works)
			mousewheel: {
				forceToAxis: true,
				sensitivity: 0.8,
				releaseOnEdges: true,
			},
			navigation: {
				nextEl: el.querySelector(".swiper-button-next"),
				prevEl: el.querySelector(".swiper-button-prev"),
			},
			breakpoints: {
				640: { slidesPerView: 1.4, spaceBetween: 14 },
				768: { slidesPerView: 2.2, spaceBetween: 16, centeredSlides: false },
				1024: { slidesPerView: 3.2, spaceBetween: 16, centeredSlides: false },
			},
		});
	});
});
