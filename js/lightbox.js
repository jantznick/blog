document.addEventListener("DOMContentLoaded", function () {
	// Find all *wrappers* containing lightbox-able media
	// Includes wrappers in posts OR in inline carousels (but not clones)
	const mediaWrappers = Array.from(document.querySelectorAll(
		".tmpl-post .lightbox-image-wrapper, .inline-carousel .lightbox-image-wrapper:not(.glide__slide--clone .lightbox-image-wrapper)"
	));

	if (mediaWrappers.length === 0) return;

	const lightbox = document.createElement("div");
	lightbox.classList.add("lightbox", "fixed", "inset-0", "bg-black", "bg-opacity-75", "flex", "flex-col", "items-center", "justify-center", "z-50", "hidden", "p-4");
	document.body.appendChild(lightbox);

	// --- Glide.js structure ---
	const glide = document.createElement("div");
	glide.classList.add("glide", "relative", "w-full", "max-w-full", "max-h-[95vh]");
	lightbox.appendChild(glide);

	const glideTrack = document.createElement("div");
	glideTrack.setAttribute("data-glide-el", "track");
	glideTrack.classList.add("glide__track"); // Removed h-full if autoHeight CSS is used
	glide.appendChild(glideTrack);

	const glideSlides = document.createElement("ul");
	glideSlides.classList.add("glide__slides"); // Removed h-full
	glideTrack.appendChild(glideSlides);

	// --- Video Extensions Definition ---
	const videoExtensions = ['mp4', 'webm', 'ogg', 'mov'];

	// --- REMOVED dynamic arrow creation, using static ones in HTML now? No, keeping dynamic lightbox arrows.
	const glideArrows = document.createElement("div");
	glideArrows.setAttribute("data-glide-el", "controls");
	glideArrows.classList.add("glide__arrows");
	glideArrows.innerHTML = `
        <button class="glide__arrow glide__arrow--left absolute top-1/2 left-0 transform -translate-y-1/2 ml-2 md:ml-4 text-5xl cursor-pointer p-3 md:p-4 rounded-full focus:outline-none transition-colors duration-150" data-glide-dir="<">&#10094;</button>
        <button class="glide__arrow glide__arrow--right absolute top-1/2 right-0 transform -translate-y-1/2 mr-2 md:mr-4 text-5xl cursor-pointer p-3 md:p-4 rounded-full focus:outline-none transition-colors duration-150" data-glide-dir=">">&#10095;</button>
    `;
	glide.appendChild(glideArrows);

	const close = document.createElement("span");
	close.classList.add("close", "absolute", "top-0", "right-0", "m-2", "text-white", "text-2xl", "leading-none", "cursor-pointer", "z-10", "bg-black", "bg-opacity-30", "hover:bg-opacity-50", "rounded-full", "w-8", "h-8", "flex", "items-center", "justify-center", "transition-colors", "duration-150");
	close.innerHTML = "&times;";
	glide.appendChild(close);

	let glideInstance = null; // To hold the Glide instance

	// Iterate over the *wrappers* and attach listener to each
	mediaWrappers.forEach((wrapper, index) => {
		// Find the media element (img or video) within this wrapper
		const mediaElement = wrapper.querySelector('img, video');
		if (!mediaElement) return; // Skip if no media found inside

		// Attach click listener to the *wrapper*
		wrapper.addEventListener("click", () => {

			// --- Populate Glide slides ---
			// Query for *all* wrappers again to build the full gallery
			const allWrappers = Array.from(document.querySelectorAll(
				".tmpl-post .lightbox-image-wrapper, .inline-carousel .lightbox-image-wrapper:not(.glide__slide--clone .lightbox-image-wrapper)"
			));

			glideSlides.innerHTML = ''; // Clear existing slides

			// Iterate through all wrappers to build slides
			allWrappers.forEach(currentWrapper => {
				// Find the media element inside the current wrapper for the slide
				const slideMediaElement = currentWrapper.querySelector('img, video');
				if (!slideMediaElement) return; // Skip if this wrapper is empty

				const slide = document.createElement("li");
				slide.classList.add("glide__slide", "flex", "items-center", "justify-center");

				const slideContentWrapper = document.createElement("div");
				// Use grid with explicit rows for media and caption. Center content horizontally.
				slideContentWrapper.classList.add("relative", "grid", "place-items-center", "max-w-full"); // Added gap and padding

				const src = slideMediaElement.src || ''; 
				const isVideo = slideMediaElement.tagName === 'VIDEO'; // Check tag name

				// --- Create Media Element (Image or Video) --- 
				let lightboxMediaElement; // Use a different name to avoid conflict
				if (isVideo) {
					lightboxMediaElement = document.createElement('video');
					lightboxMediaElement.src = src; // Use the original src
					// lightboxMediaElement.controls = true;
					lightboxMediaElement.muted = true;
					lightboxMediaElement.loop = true; // Optional: remove if looping is not desired
					lightboxMediaElement.playsInline = true; // Important for iOS
					// Add necessary classes for styling and consistency
					lightboxMediaElement.classList.add("rounded-overflow", "lightbox-media", "lightbox-video", "object-contain", "max-w-full", "w-auto", "h-auto", "rounded-md", "row-start-1", "col-start-1"); 
					lightboxMediaElement.style.transform = 'rotate(180deg)';
					lightboxMediaElement.title = slideMediaElement.alt || '';
				} else {
					lightboxMediaElement = document.createElement('img');
					lightboxMediaElement.src = src;
					lightboxMediaElement.alt = slideMediaElement.alt || '';
					lightboxMediaElement.classList.add("rounded-overflow", "lightbox-media", "lightbox-image", "object-contain", "max-w-full", "w-auto", "h-auto", "rounded-md", "row-start-1", "col-start-1"); // Explicitly row 1
				}
				slideContentWrapper.appendChild(lightboxMediaElement); // Add the media element to the slide content wrapper

				if (isVideo) {
					const playPauseWrapper = document.createElement("div");
					playPauseWrapper.classList.add("video-play-button");
					const elements = [lightboxMediaElement, playPauseWrapper];
					elements.forEach(element => {
						element.addEventListener("click", () => {
							lightboxMediaElement.play();
							playPauseWrapper.classList.add('svg-hidden');
							lightboxMediaElement.addEventListener('click', () => {
								playPauseWrapper.classList.remove('svg-hidden');
								lightboxMediaElement.pause();
							})
						});
					});
					playPauseWrapper.innerHTML =
							`<span class="video-play-icon">` +
								`<svg class="control-icon icon-play w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347c.75.411.75 1.559 0 1.97l-11.54 6.347c-.75.411-1.667-.13-1.667-.986V5.653Z" /></svg>` +
							`</span>` ;
					slideContentWrapper.appendChild(playPauseWrapper);

					const muteButton = document.createElement("div");
					muteButton.classList.add("video-mute-button");
					muteButton.addEventListener("click", () => {
						lightboxMediaElement.muted = !lightboxMediaElement.muted;
						document.getElementById('muted-icon').classList.toggle('svg-hidden');
						document.getElementById('unmuted-icon').classList.toggle('svg-hidden');
					});
					muteButton.innerHTML =
						`<span class="video-mute-icon">` +
							// Updated path for muted speaker icon
							`<svg id="muted-icon" class="icon-mute w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25M17.25 9.75L19.5 12M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>` +
							// Updated path for unmuted speaker icon
							`<svg id="unmuted-icon" class="control-icon svg-hidden icon-unmute w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>` +
						`</span>` ;
					slideContentWrapper.appendChild(muteButton);
				}

				// --- Create and add caption --- 
				// Get caption/alt from the *original* media element in the page, not the cloned one
				const rawCaption = slideMediaElement.dataset?.caption || (slideMediaElement.closest('.lightbox-image-wrapper')?.querySelector('img[data-caption], video[data-caption]')?.dataset?.caption) || ''; // More robust caption finding
				const rawAlt = slideMediaElement.alt || '';
				const captionSource = String(rawCaption || (!isVideo ? rawAlt : '') || '');

				// --- Always create the main caption/icon container ---
				const slideCaptionWrapper = document.createElement("div");
				// Place this wrapper in the second row, spanning the column. Ensure it takes necessary width.
				slideCaptionWrapper.classList.add("image-caption-wrapper", "flex", "justify-between", "items-center", "w-full", "max-w-xl", "row-start-2", "col-start-1"); // Explicitly row 2, add width constraints

				// --- Conditionally create and add caption text ---
				if (captionSource.trim() !== '') {
					const delimiter = "::";
					let titleText = '';
					let descriptionText = '';

					const textWrapper = document.createElement('div');
					textWrapper.classList.add("caption-text-content");

					if (captionSource.includes(delimiter)) {
						const parts = captionSource.split(delimiter, 2);
						titleText = parts[0].trim();
						descriptionText = parts[1].trim();
					} else {
						// If no delimiter, assume it's just the title (or description if preferred)
						titleText = captionSource.trim();
					}

					if (titleText) {
						const titleElement = document.createElement("span");
						titleElement.classList.add("image-caption-title");
						titleElement.textContent = titleText;
						textWrapper.appendChild(titleElement);
					}

					if (descriptionText) {
						const descriptionElement = document.createElement("span");
						descriptionElement.classList.add("image-caption-description");
						if (titleText) {
							descriptionElement.classList.add("mt-1");
						}
						descriptionElement.textContent = descriptionText;
						textWrapper.appendChild(descriptionElement);
					}

					// Only append text wrapper if it has content
					if (textWrapper.hasChildNodes()) {
						slideCaptionWrapper.appendChild(textWrapper);
					}
				}
				// --- End of conditional caption text creation ---

				// --- Always create and add download icon --- 
				const downloadWrapper = document.createElement("div");
				const mediaUrl = slideMediaElement.src; // Use the correct src
				const filename = mediaUrl ? (mediaUrl.split('/').pop() || (isVideo ? 'downloaded-video' : 'downloaded-image')) : (isVideo ? 'downloaded-video' : 'downloaded-image'); // Default filename based on type

				downloadWrapper.innerHTML =
					`<a href="${mediaUrl || '#'}" download="${filename}" class="download-link" title="Download ${isVideo ? 'video' : 'image'}">` + // Dynamic title
					`<span class="download-icon">` +
					`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>` +
					`</span>` +
					`</a>`;
				downloadWrapper.classList.add("caption-download-icon-container");

				slideCaptionWrapper.appendChild(downloadWrapper); // Append icon TO the caption wrapper
				// --- End of download icon addition ---

				// --- Always add the caption wrapper (might contain only icon) to the slide content wrapper --- 
				// Ensure it's added AFTER potentially adding text to it
				slideContentWrapper.appendChild(slideCaptionWrapper);

				slide.appendChild(slideContentWrapper);
				glideSlides.appendChild(slide);
			});

			lightbox.style.display = "flex";

			// Destroy previous instance if exists
			if (glideInstance) {
				glideInstance.destroy();
			}

			// Initialize Glide.js starting at the *index* of the clicked *wrapper*
			glideInstance = new Glide(glide, {
				type: 'slider',
				startAt: index, // Use the index from the initial mediaWrappers.forEach loop
				// Default (Desktop) settings
				perView: 3,
				gap: 10,
				focusAt: 'center',
				peek: { before: 50, after: 50 },
				// Responsive settings
				breakpoints: {
					1023: {
						perView: 2,
						peek: { before: 25, after: 25 }
					},
					767: {
						perView: 1,
						peek: 0
					}
				}
			});

			glideInstance.mount();
		});
	});

	close.addEventListener("click", (e) => {
		e.stopPropagation();
		lightbox.style.display = "none";
		if (glideInstance) {
			glideInstance.destroy();
			glideInstance = null;
		}
	});

	lightbox.addEventListener("click", (e) => {
		// Close only if clicking the backdrop itself
		if (e.target === lightbox) {
			lightbox.style.display = "none";
			if (glideInstance) {
				glideInstance.destroy();
				glideInstance = null;
			}
		}
	});

	// Optional: Add keyboard navigation
	document.addEventListener('keydown', (e) => {
		if (lightbox.style.display !== 'none' && glideInstance) {
			if (e.key === 'ArrowLeft') {
				glideInstance.go('<');
			} else if (e.key === 'ArrowRight') {
				glideInstance.go('>');
			} else if (e.key === 'Escape') {
				close.click(); // Trigger close action
			}
		}
	});

});
