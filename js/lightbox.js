document.addEventListener("DOMContentLoaded", function () {
    // Find all images on the page intended for the lightbox
    // Include images in posts OR in inline carousels (but not clones or lightbox itself)
    const pageImages = Array.from(document.querySelectorAll(".tmpl-post img, .inline-carousel .carousel-image:not(.glide__slide--clone .carousel-image)"));
    
    if (pageImages.length === 0) return; // Don't setup lightbox if no images

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

    pageImages.forEach((image, index) => {
        // --- REMOVED Wrapper and Icon dynamic creation --- 
        // The shortcode now generates the .lightbox-image-wrapper and icon

        // Attach click listener to the image itself
        image.addEventListener("click", () => {

            // --- Populate Glide slides --- 
            // Ensure we use the *same* query selector here to get the list of *all* eligible images
            const eligiblePageImages = Array.from(document.querySelectorAll(".tmpl-post img, .inline-carousel .carousel-image:not(.glide__slide--clone .carousel-image)"));
            
            glideSlides.innerHTML = ''; // Clear existing slides
            eligiblePageImages.forEach(imgData => {
                const slide = document.createElement("li");
                // Slide is just a flex container, centering the wrapper
                slide.classList.add("glide__slide", "flex", "items-center", "justify-center");

                // --- Create an inner wrapper using GRID ---
                const imageWrapper = document.createElement("div");
                // Grid context for layering image and caption, constrain width only
                imageWrapper.classList.add("relative", "grid", "place-items-center", "max-w-full");

                const img = document.createElement("img");
                img.src = imgData?.src || ''; // Added check for imgData.src
                img.alt = imgData?.alt || ''; // Added check and fallback for alt
                // Image fills wrapper width constraint, remove height constraint
                img.classList.add("object-contain", "max-w-full", "w-auto", "h-auto", "rounded-md", "col-start-1", "row-start-1");
                imageWrapper.appendChild(img); // Add image to wrapper

                // --- Create and add caption INSIDE the wrapper, using custom CSS classes ---
                // Ensure we have strings to work with, even if attributes are missing
                const rawCaption = imgData?.dataset?.['caption'] || ''; 
                const rawAlt = imgData?.alt || '';
                const captionSource = String(rawCaption || rawAlt || ''); // Guarantee a string
                
                // --- Always create the main caption/icon container ---
                const slideCaptionWrapper = document.createElement("div");
                slideCaptionWrapper.classList.add("image-caption-wrapper", "flex", "justify-between", "items-center");

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
                const imageUrl = imgData.src;
                const filename = imageUrl ? (imageUrl.split('/').pop() || 'downloaded-image') : 'downloaded-image';

                downloadWrapper.innerHTML = 
                    `<a href="${imageUrl || '#'}" download="${filename}" class="download-link" title="Download image">` +
                      `<span class="download-icon">` +
                        `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>` + 
                      `</span>` +
                    `</a>`;
                downloadWrapper.classList.add("caption-download-icon-container"); 

                slideCaptionWrapper.appendChild(downloadWrapper); // Append icon TO the caption wrapper
                // --- End of download icon addition ---

                // --- Always add the caption wrapper (might contain only icon) to the image wrapper ---
                imageWrapper.appendChild(slideCaptionWrapper);

                slide.appendChild(imageWrapper);
                glideSlides.appendChild(slide);
            });

            lightbox.style.display = "flex";

            // Destroy previous instance if exists
            if (glideInstance) {
                glideInstance.destroy();
            }

            // --- Initialize Glide.js ---
            // The `index` here should be the index of the clicked image 
            // within the full `pageImages` (or `eligiblePageImages`) list
            glideInstance = new Glide(glide, {
                type: 'slider',
                startAt: index, // Use the index from the initial forEach loop
                // Default (Desktop) settings
                perView: 3,
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
