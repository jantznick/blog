/**
 * PhotoSwipe lightbox for carousel images + videos.
 */
document.addEventListener("DOMContentLoaded", function () {
	if (typeof PhotoSwipeLightbox === "undefined" || typeof PhotoSwipe === "undefined") {
		console.error("PhotoSwipe is not loaded.");
		return;
	}

	const galleries = document.querySelectorAll(".inline-carousel");
	if (!galleries.length) return;

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

	function isVideoSrc(src) {
		return /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(src || "");
	}

	function applyNaturalSize(itemData, img) {
		if (img?.naturalWidth > 0 && img?.naturalHeight > 0) {
			itemData.width = img.naturalWidth;
			itemData.height = img.naturalHeight;
			return true;
		}
		return false;
	}

	galleries.forEach((gallery) => {
		const lightbox = new PhotoSwipeLightbox({
			gallery,
			children: "a.carousel-zoom-link",
			pswpModule: PhotoSwipe,
			// Click the dark backdrop (outside the image) to close
			bgClickAction: "close",
			clickToCloseNonZoomable: true,
			imageClickAction: "zoom-or-close",
			paddingFn: () => ({ top: 24, bottom: 48, left: 16, right: 16 }),
		});

		lightbox.addFilter("domItemData", (itemData, element) => {
			if (!(element instanceof Element)) return itemData;

			const img = element.querySelector("img");
			const src = itemData.src || element.getAttribute("href") || "";
			const caption =
				element.getAttribute("data-caption") ||
				img?.getAttribute("data-caption") ||
				img?.getAttribute("alt") ||
				"";

			if (element.getAttribute("data-pswp-type") === "video" || isVideoSrc(src)) {
				itemData.type = "video";
				itemData.videoSrc = element.getAttribute("data-pswp-src") || src;
				itemData.width = Number(element.getAttribute("data-pswp-width")) || 1920;
				itemData.height = Number(element.getAttribute("data-pswp-height")) || 1080;
			} else {
				// Always prefer real pixel size so aspect ratio isn't stretched
				if (!applyNaturalSize(itemData, img)) {
					// Temporary placeholder; corrected on contentLoad once the full image loads
					itemData.width = itemData.width || 1600;
					itemData.height = itemData.height || 1200;
				}
			}

			itemData.alt = img?.getAttribute("alt") || "";
			itemData.caption = caption;
			return itemData;
		});

		lightbox.on("contentLoad", (event) => {
			const { content } = event;
			const data = content?.data;
			if (!data) return;

			const videoSrc = data.videoSrc || (data.type === "video" ? data.src : null);
			const treatAsVideo = data.type === "video" || Boolean(data.videoSrc) || isVideoSrc(data.src);

			if (treatAsVideo) {
				event.preventDefault();

				const wrap = document.createElement("div");
				wrap.className = "pswp__video-wrap";

				const video = document.createElement("video");
				video.className = "pswp__video";
				video.src = videoSrc || data.src;
				video.controls = true;
				video.playsInline = true;
				video.setAttribute("playsinline", "");
				video.preload = "metadata";

				wrap.appendChild(video);
				content.element = wrap;
				content.state = "loading";

				const markLoaded = () => {
					if (video.videoWidth > 0 && video.videoHeight > 0) {
						data.width = video.videoWidth;
						data.height = video.videoHeight;
					}
					if (content.state === "loading") content.onLoaded();
				};

				video.addEventListener("loadedmetadata", markLoaded, { once: true });
				video.addEventListener("error", markLoaded, { once: true });
				setTimeout(markLoaded, 400);
				return;
			}

			// After the full-size image loads, fix width/height if the thumb hadn't decoded yet
			const imgEl = content.element;
			if (imgEl && imgEl.tagName === "IMG") {
				const fixSize = () => {
					if (imgEl.naturalWidth > 0 && imgEl.naturalHeight > 0) {
						const w = imgEl.naturalWidth;
						const h = imgEl.naturalHeight;
						if (data.width !== w || data.height !== h) {
							data.width = w;
							data.height = h;
							if (content.instance) {
								content.instance.updateSize(true);
							}
						}
					}
				};
				if (imgEl.complete) fixSize();
				else imgEl.addEventListener("load", fixSize, { once: true });
			}
		});

		lightbox.on("change", () => {
			document.querySelectorAll(".pswp__video").forEach((video) => {
				if (!video.paused) video.pause();
			});
		});

		lightbox.on("closingAnimationStart", () => {
			document.querySelectorAll(".pswp__video").forEach((video) => {
				video.pause();
			});
		});

		lightbox.on("uiRegister", function () {
			lightbox.pswp.ui.registerElement({
				name: "custom-caption",
				order: 9,
				isButton: false,
				appendTo: "root",
				html: "",
				onInit: (el, pswp) => {
					el.classList.add("pswp-caption-bottom");
					pswp.on("change", () => {
						const { title, description } = parseCaption(pswp.currSlide?.data?.caption);
						el.innerHTML = "";
						if (!title && !description) {
							el.style.display = "none";
							return;
						}
						el.style.display = "block";
						if (title) {
							const t = document.createElement("div");
							t.className = "pswp-caption-title";
							t.textContent = title;
							el.appendChild(t);
						}
						if (description) {
							const d = document.createElement("div");
							d.className = "pswp-caption-description";
							d.textContent = description;
							el.appendChild(d);
						}
					});
				},
			});
		});

		lightbox.init();
	});
});
