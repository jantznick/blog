/**
 * Fullscreen media lightbox for post images/videos.
 * Works with standalone images and Glide inline carousels.
 * Mobile: swipe, large tap targets, scroll lock. Desktop: arrows + keyboard.
 */
(function () {
	const VIDEO_EXT = /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i;
	const SWIPE_THRESHOLD = 50;
	const CLICK_MOVE_TOLERANCE = 10;

	function isClone(el) {
		return Boolean(el.closest(".glide__slide--clone"));
	}

	function isVideoSrc(src) {
		return VIDEO_EXT.test(src || "");
	}

	function parseCaption(raw) {
		const text = String(raw || "").trim();
		if (!text) return { title: "", description: "" };
		const delimiter = "::";
		if (text.includes(delimiter)) {
			const [title, description] = text.split(delimiter, 2);
			return { title: title.trim(), description: (description || "").trim() };
		}
		return { title: text, description: "" };
	}

	function collectWrappers(clickedWrapper) {
		const carousel = clickedWrapper.closest(".inline-carousel");
		const root = carousel || document.querySelector("main") || document;
		const selector = carousel
			? ".glide__slide:not(.glide__slide--clone) .lightbox-image-wrapper"
			: ".lightbox-image-wrapper";

		return Array.from(root.querySelectorAll(selector)).filter((wrapper) => {
			if (isClone(wrapper)) return false;
			return Boolean(wrapper.querySelector("img, video"));
		});
	}

	function mediaFromWrapper(wrapper) {
		const media = wrapper.querySelector("img, video");
		if (!media) return null;
		const src = media.currentSrc || media.src || media.getAttribute("src") || "";
		if (!src) return null;
		const captionRaw = media.dataset.caption || media.getAttribute("data-caption") || "";
		const alt = media.getAttribute("alt") || "";
		const video = media.tagName === "VIDEO" || isVideoSrc(src);
		return { src, alt, captionRaw, video };
	}

	function createEl(tag, className, attrs) {
		const el = document.createElement(tag);
		if (className) el.className = className;
		if (attrs) {
			Object.entries(attrs).forEach(([key, value]) => {
				if (value === undefined || value === null) return;
				if (key === "text") el.textContent = value;
				else if (key === "html") el.innerHTML = value;
				else el.setAttribute(key, value);
			});
		}
		return el;
	}

	document.addEventListener("DOMContentLoaded", () => {
		const shell = createEl("div", "lightbox", {
			role: "dialog",
			"aria-modal": "true",
			"aria-label": "Photo viewer",
			hidden: "true",
		});

		const stage = createEl("div", "lightbox-stage");
		const mediaHost = createEl("div", "lightbox-media-host");
		const captionBar = createEl("div", "lightbox-caption-bar");
		const captionText = createEl("div", "lightbox-caption-text");
		const downloadLink = createEl("a", "download-link lightbox-download", {
			title: "Download",
			download: "",
		});
		downloadLink.innerHTML =
			'<span class="download-icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg></span>';

		captionBar.appendChild(captionText);
		captionBar.appendChild(downloadLink);

		const closeBtn = createEl("button", "lightbox-close", {
			type: "button",
			"aria-label": "Close",
			html: "&times;",
		});
		const prevBtn = createEl("button", "lightbox-nav lightbox-prev", {
			type: "button",
			"aria-label": "Previous",
			html: "&#10094;",
		});
		const nextBtn = createEl("button", "lightbox-nav lightbox-next", {
			type: "button",
			"aria-label": "Next",
			html: "&#10095;",
		});
		const counter = createEl("div", "lightbox-counter");

		const playBtn = createEl("button", "lightbox-video-btn lightbox-play-btn", {
			type: "button",
			"aria-label": "Play video",
			hidden: "true",
		});
		playBtn.innerHTML =
			'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347c.75.411.75 1.559 0 1.97l-11.54 6.347c-.75.411-1.667-.13-1.667-.986V5.653Z" /></svg>';

		const muteBtn = createEl("button", "lightbox-video-btn lightbox-mute-btn", {
			type: "button",
			"aria-label": "Toggle mute",
			hidden: "true",
		});
		muteBtn.innerHTML =
			'<svg class="icon-muted" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" /></svg>' +
			'<svg class="icon-unmuted svg-hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" /></svg>';

		stage.appendChild(mediaHost);
		stage.appendChild(captionBar);
		stage.appendChild(playBtn);
		stage.appendChild(muteBtn);
		shell.appendChild(stage);
		shell.appendChild(closeBtn);
		shell.appendChild(prevBtn);
		shell.appendChild(nextBtn);
		shell.appendChild(counter);
		document.body.appendChild(shell);

		let items = [];
		let index = 0;
		let currentMedia = null;
		let open = false;
		let touchStartX = 0;
		let touchStartY = 0;
		let touchDeltaX = 0;

		function setInlineCarouselsBlocked(blocked) {
			document.querySelectorAll(".inline-carousel").forEach((carousel) => {
				carousel.classList.toggle("is-lightbox-blocked", blocked);
				const glide = carousel.__inlineGlideInstance;
				if (!glide) return;
				if (blocked && typeof glide.disable === "function") glide.disable();
				if (!blocked && typeof glide.enable === "function") glide.enable();
			});
		}

		function updateChrome() {
			const multi = items.length > 1;
			prevBtn.hidden = !multi;
			nextBtn.hidden = !multi;
			counter.hidden = !multi;
			if (multi) counter.textContent = `${index + 1} / ${items.length}`;
		}

		function stopMedia() {
			if (currentMedia && currentMedia.tagName === "VIDEO") {
				currentMedia.pause();
				currentMedia.removeAttribute("src");
				currentMedia.load();
			}
			currentMedia = null;
		}

		function updateMuteIcons(muted) {
			const mutedIcon = muteBtn.querySelector(".icon-muted");
			const unmutedIcon = muteBtn.querySelector(".icon-unmuted");
			if (!mutedIcon || !unmutedIcon) return;
			mutedIcon.classList.toggle("svg-hidden", !muted);
			unmutedIcon.classList.toggle("svg-hidden", muted);
		}

		function render() {
			const item = items[index];
			if (!item) return;

			stopMedia();
			mediaHost.innerHTML = "";

			const { title, description } = parseCaption(item.captionRaw || item.alt);
			captionText.innerHTML = "";
			if (title) {
				captionText.appendChild(createEl("span", "image-caption-title", { text: title }));
			}
			if (description) {
				const desc = createEl("span", "image-caption-description", { text: description });
				if (title) desc.classList.add("mt-1");
				captionText.appendChild(desc);
			}
			captionBar.hidden = !(title || description);

			const filename = (item.src.split("/").pop() || "download").split("?")[0];
			downloadLink.href = item.src;
			downloadLink.setAttribute("download", filename);
			downloadLink.title = item.video ? "Download video" : "Download image";

			if (item.video) {
				const video = createEl("video", "lightbox-media lightbox-video", {
					playsinline: "",
					preload: "metadata",
				});
				video.src = item.src;
				video.muted = true;
				video.loop = true;
				video.setAttribute("playsinline", "");
				mediaHost.appendChild(video);
				currentMedia = video;
				playBtn.hidden = false;
				muteBtn.hidden = false;
				updateMuteIcons(true);
				video.addEventListener("play", () => {
					playBtn.hidden = true;
				});
				video.addEventListener("pause", () => {
					playBtn.hidden = false;
				});
			} else {
				const img = createEl("img", "lightbox-media lightbox-image", {
					alt: item.alt || title || "",
					src: item.src,
				});
				mediaHost.appendChild(img);
				currentMedia = img;
				playBtn.hidden = true;
				muteBtn.hidden = true;
			}

			updateChrome();
		}

		function closeLightbox() {
			if (!open) return;
			open = false;
			stopMedia();
			shell.hidden = true;
			shell.classList.remove("is-open");
			document.body.classList.remove("lightbox-open");
			setInlineCarouselsBlocked(false);
		}

		function openLightbox(wrappers, startIndex) {
			items = wrappers.map(mediaFromWrapper).filter(Boolean);
			if (!items.length) return;
			index = Math.max(0, Math.min(startIndex, items.length - 1));
			open = true;
			document.body.classList.add("lightbox-open");
			setInlineCarouselsBlocked(true);
			shell.hidden = false;
			shell.classList.add("is-open");
			render();
			closeBtn.focus({ preventScroll: true });
		}

		function go(delta) {
			if (items.length < 2) return;
			index = (index + delta + items.length) % items.length;
			render();
		}

		function bindOpenHandlers() {
			document.querySelectorAll(".lightbox-image-wrapper").forEach((wrapper) => {
				if (wrapper.dataset.lightboxBound === "1") return;
				wrapper.dataset.lightboxBound = "1";

				let pointerStart = null;
				let moved = false;

				wrapper.addEventListener("pointerdown", (e) => {
					if (e.button !== undefined && e.button !== 0) return;
					if (e.pointerType === "mouse" && e.buttons !== 1) return;
					pointerStart = { x: e.clientX, y: e.clientY };
					moved = false;
				});

				wrapper.addEventListener("pointermove", (e) => {
					if (!pointerStart) return;
					// Ignore hover moves — only track while a button is held (or touch)
					if (e.pointerType === "mouse" && e.buttons !== 1) {
						pointerStart = null;
						moved = false;
						return;
					}
					const dx = Math.abs(e.clientX - pointerStart.x);
					const dy = Math.abs(e.clientY - pointerStart.y);
					if (dx > CLICK_MOVE_TOLERANCE || dy > CLICK_MOVE_TOLERANCE) {
						moved = true;
					}
				});

				wrapper.addEventListener("pointerup", (e) => {
					const start = pointerStart;
					pointerStart = null;
					if (!start || moved) return;
					if (e.target.closest(".glide__arrow, .video-play-button, a, button")) return;

					const wrappers = collectWrappers(wrapper);
					const startIndex = wrappers.indexOf(wrapper);
					if (startIndex < 0) return;
					e.preventDefault();
					e.stopPropagation();
					openLightbox(wrappers, startIndex);
				});

				wrapper.addEventListener("pointercancel", () => {
					pointerStart = null;
					moved = false;
				});
			});
		}

		// Re-bind after Glide mounts clones / late content
		bindOpenHandlers();
		setTimeout(bindOpenHandlers, 0);
		setTimeout(bindOpenHandlers, 500);

		closeBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			closeLightbox();
		});
		prevBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			go(-1);
		});
		nextBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			go(1);
		});
		shell.addEventListener("click", (e) => {
			if (e.target === shell) closeLightbox();
		});

		playBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			if (!currentMedia || currentMedia.tagName !== "VIDEO") return;
			currentMedia.play().catch(() => {});
		});

		muteBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			if (!currentMedia || currentMedia.tagName !== "VIDEO") return;
			currentMedia.muted = !currentMedia.muted;
			updateMuteIcons(currentMedia.muted);
		});

		mediaHost.addEventListener("click", (e) => {
			e.stopPropagation();
			if (!currentMedia || currentMedia.tagName !== "VIDEO") return;
			if (currentMedia.paused) {
				currentMedia.play().catch(() => {});
			} else {
				currentMedia.pause();
			}
		});

		downloadLink.addEventListener("click", (e) => e.stopPropagation());

		document.addEventListener("keydown", (e) => {
			if (!open) return;
			if (e.key === "Escape") closeLightbox();
			else if (e.key === "ArrowLeft") go(-1);
			else if (e.key === "ArrowRight") go(1);
		});

		shell.addEventListener(
			"touchstart",
			(e) => {
				if (!open || !e.changedTouches[0]) return;
				touchStartX = e.changedTouches[0].clientX;
				touchStartY = e.changedTouches[0].clientY;
				touchDeltaX = 0;
			},
			{ passive: true }
		);

		shell.addEventListener(
			"touchmove",
			(e) => {
				if (!open || !e.changedTouches[0]) return;
				touchDeltaX = e.changedTouches[0].clientX - touchStartX;
			},
			{ passive: true }
		);

		shell.addEventListener(
			"touchend",
			(e) => {
				if (!open || !e.changedTouches[0]) return;
				const dx = e.changedTouches[0].clientX - touchStartX;
				const dy = e.changedTouches[0].clientY - touchStartY;
				if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
				if (dx < 0) go(1);
				else go(-1);
			},
			{ passive: true }
		);
	});
})();
