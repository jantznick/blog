document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded and parsed");
    const pageImages = document.querySelectorAll("img:not(.lightbox img):not(.glide img)"); // Renamed to avoid conflict
    console.log(`Found ${pageImages.length} eligible images for lightbox`);
    if (pageImages.length === 0) return; // Don't setup lightbox if no images

    const lightbox = document.createElement("div");
    lightbox.classList.add("lightbox", "fixed", "inset-0", "bg-black", "bg-opacity-75", "flex", "flex-col", "items-center", "justify-center", "z-50", "hidden", "p-4"); // Added padding
    document.body.appendChild(lightbox);

    // --- Glide.js structure ---
    const glide = document.createElement("div");
    glide.classList.add("glide", "relative", "w-full", "h-full", "max-w-4xl", "max-h-[90vh]"); // Added size constraints
    lightbox.appendChild(glide);

    const glideTrack = document.createElement("div");
    glideTrack.setAttribute("data-glide-el", "track");
    glideTrack.classList.add("glide__track", "h-full");
    glide.appendChild(glideTrack);

    const glideSlides = document.createElement("ul");
    glideSlides.classList.add("glide__slides", "h-full"); // Ensure slides container takes height
    glideTrack.appendChild(glideSlides);
    // Slides (li > img) will be added dynamically

    // Optional: Add Glide Arrows if needed (can be styled/positioned)
    const glideArrows = document.createElement("div");
    glideArrows.setAttribute("data-glide-el", "controls");
    glideArrows.classList.add("glide__arrows");
    // Added hover effect, increased padding
    glideArrows.innerHTML = `
        <button class="glide__arrow glide__arrow--left absolute top-1/2 left-0 transform -translate-y-1/2 ml-2 md:ml-4 text-white text-4xl cursor-pointer bg-black bg-opacity-30 hover:bg-opacity-50 p-2 md:p-3 rounded-full focus:outline-none transition-colors duration-150" data-glide-dir="<">&#10094;</button>
        <button class="glide__arrow glide__arrow--right absolute top-1/2 right-0 transform -translate-y-1/2 mr-2 md:mr-4 text-white text-4xl cursor-pointer bg-black bg-opacity-30 hover:bg-opacity-50 p-2 md:p-3 rounded-full focus:outline-none transition-colors duration-150" data-glide-dir=">">&#10095;</button>
    `;
    glide.appendChild(glideArrows);

    const close = document.createElement("span");
    close.classList.add("close", "absolute", "top-0", "right-0", "m-2", "text-white", "text-2xl", "leading-none", "cursor-pointer", "z-10", "bg-black", "bg-opacity-30", "hover:bg-opacity-50", "rounded-full", "w-8", "h-8", "flex", "items-center", "justify-center", "transition-colors", "duration-150");
    close.innerHTML = "&times;";
    glide.appendChild(close);

    let glideInstance = null; // To hold the Glide instance

    pageImages.forEach((image, index) => {
        // --- Create Wrapper and Icon --- 
		console.log(image);
        if (image.closest('.lightbox-image-wrapper')) {
            // Already processed this image (e.g., if script runs twice)
            console.log(`Skipping already wrapped image: ${image.src}`);
            return;
        }
        
        const wrapper = document.createElement('div');
        // Use inline-block to wrap the image size, relative for icon positioning
        wrapper.classList.add('lightbox-image-wrapper', 'relative', 'inline-block', 'align-bottom'); // align-bottom helps prevent extra space

        const icon = document.createElement('span');
        icon.classList.add('lightbox-indicator-icon', 'absolute', 'top-[1em]', 'right-[1em]'); // Position top-right
        // Simple SVG Expand icon (customize appearance via CSS)
        icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9M20.25 20.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>`;
        icon.setAttribute('aria-hidden', 'true'); // Hide decorative icon from screen readers
        
        // Insert wrapper before image, move image inside, add icon
        image.parentNode.insertBefore(wrapper, image);
        wrapper.appendChild(image);
        wrapper.appendChild(icon);
        // --- End Wrapper and Icon ---

        // Attach click listener to the image itself (or wrapper if preferred)
        image.addEventListener("click", () => {
            console.log(`Image clicked: ${image.src}, index: ${index}`);

            // --- Populate Glide slides --- 
            // Ensure we use the *original* list of images, not ones inside other modals
            const eligiblePageImages = Array.from(document.querySelectorAll("img:not(.lightbox img):not(.glide img)"));
            
            glideSlides.innerHTML = ''; // Clear existing slides
            eligiblePageImages.forEach(imgData => {
                const slide = document.createElement("li");
                // Slide is just a flex container, centering the wrapper
                slide.classList.add("glide__slide", "flex", "items-center", "justify-center", "h-full");

                // --- Create an inner wrapper using GRID ---
                const imageWrapper = document.createElement("div");
                // Grid context for layering image and caption, constrain size
                imageWrapper.classList.add("relative", "grid", "place-items-center", "max-w-full", "max-h-full", "rounded-overflow");

                const img = document.createElement("img");
                img.src = imgData.src;
                img.alt = imgData.alt; // Keep alt text
                // Image fills wrapper constraints, place in grid cell 1,1
                img.classList.add("object-contain", "max-w-full", "max-h-full", "w-auto", "h-auto", "rounded-md", "col-start-1", "row-start-1");
                imageWrapper.appendChild(img); // Add image to wrapper

                // --- Create and add caption INSIDE the wrapper, using custom CSS classes ---
                if (imgData.dataset['caption'] && imgData.dataset['caption'].trim() !== '') { // Only add caption if data-caption exists and is not empty
                    const slideCaptionWrapper = document.createElement("div");
                    // Use a semantic class for custom CSS styling - Add flex display
                    slideCaptionWrapper.classList.add("image-caption-wrapper", "flex", "justify-between", "items-center");

                    const captionText = imgData.dataset['caption'];
                    const delimiter = "::";
                    let titleText = '';
                    let descriptionText = '';

                    // --- Create wrapper for text content --- 
                    const textWrapper = document.createElement('div');
                    textWrapper.classList.add("caption-text-content"); // Add a class for potential styling

                    if (captionText.includes(delimiter)) {
                        const parts = captionText.split(delimiter, 2);
                        titleText = parts[0].trim();
                        descriptionText = parts[1].trim();
                    } else {
                        titleText = captionText.trim();
                    }

                    // --- Populate textWrapper --- 
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
                    // --- End textWrapper population ---
                    
                    // Append text wrapper to the main caption wrapper
                    slideCaptionWrapper.appendChild(textWrapper);

					const downloadWrapper = document.createElement("div");
                    const imageUrl = imgData.src;
                    const filename = imageUrl.split('/').pop() || 'downloaded-image';

                    // Revert to using a functional anchor tag with download attribute
                    downloadWrapper.innerHTML = 
                        `<a href="${imageUrl}" download="${filename}" class="download-link" title="Download image">` +
                          `<span class="download-icon">` +
                            `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>` + 
                          `</span>` +
                        `</a>`;
                    downloadWrapper.classList.add("caption-download-icon-container");

                    // Append download icon wrapper to the main caption wrapper
					slideCaptionWrapper.appendChild(downloadWrapper);

                    imageWrapper.appendChild(slideCaptionWrapper); // Add the main caption wrapper to the image wrapper
                }
                // --- End of caption addition ---

                slide.appendChild(imageWrapper); // Add the wrapper to the slide
                glideSlides.appendChild(slide);
            });

            console.log(`Populated ${pageImages.length} slides.`);
            lightbox.style.display = "flex"; // Show the modal first

            // Destroy previous instance if exists
            if (glideInstance) {
                console.log("Destroying previous Glide instance");
                glideInstance.destroy();
            }

            // --- Initialize Glide.js ---
            console.log(`Initializing Glide starting at index: ${index}`);
            glideInstance = new Glide(glide, {
                type: 'slider',
                startAt: index,
                perView: 3,
				focusAt: 'center',
                peek: { before: 50, after: 50 }
            });

            glideInstance.mount();
            console.log("Glide instance mounted.");
        });
    });

    close.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent lightbox click closing
        console.log("Close button clicked");
        lightbox.style.display = "none";
        if (glideInstance) {
            console.log("Destroying Glide instance on close.");
            glideInstance.destroy();
            glideInstance = null;
        }
    });

    lightbox.addEventListener("click", (e) => {
        // Close only if clicking the backdrop, not the glide content area
        if (e.target === lightbox) {
            console.log("Lightbox background clicked");
            lightbox.style.display = "none";
            if (glideInstance) {
                console.log("Destroying Glide instance on background click.");
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
