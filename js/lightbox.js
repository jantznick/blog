document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded and parsed");
    const pageImages = document.querySelectorAll("img"); // Renamed to avoid conflict
    console.log(`Found ${pageImages.length} images on page`);
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
        // Don't add listeners to images already inside a potential future lightbox/glide structure
        if (image.closest('.lightbox') || image.closest('.glide')) {
             console.log(`Skipping image already in modal structure: ${image.src}`);
             return;
        }
        console.log(`Adding click listener for ${image.src}`);
        image.addEventListener("click", () => {
            console.log(`Image clicked: ${image.src}, index: ${index}`);

            // --- Populate Glide slides ---
            glideSlides.innerHTML = ''; // Clear existing slides
            pageImages.forEach(imgData => {
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
                if (imgData.alt && imgData.alt.trim() !== '') { // Only add caption if alt text exists and is not empty
                    const slideCaptionWrapper = document.createElement("div");
                    // Use a semantic class for custom CSS styling
                    slideCaptionWrapper.classList.add("image-caption-wrapper");

                    const altText = imgData.alt;
                    const delimiter = "::";
                    let titleText = '';
                    let descriptionText = '';

                    if (altText.includes(delimiter)) {
                        const parts = altText.split(delimiter, 2);
                        titleText = parts[0].trim();
                        descriptionText = parts[1].trim();
                    } else {
                        descriptionText = altText.trim();
                    }

                    if (titleText) {
                        const titleElement = document.createElement("span");
                        // Use a semantic class for custom CSS styling
                        titleElement.classList.add("image-caption-title");
                        titleElement.textContent = titleText;
                        slideCaptionWrapper.appendChild(titleElement);
                    }

                    if (descriptionText) {
                        const descriptionElement = document.createElement("span");
                        // Use a semantic class for custom CSS styling
                        descriptionElement.classList.add("image-caption-description");
                        // Add margin-top class (if needed) or handle spacing in CSS
                        if (titleText) {
                            // We can still add utility classes if Tailwind *does* pick them up,
                            // or handle this margin purely in CSS for .image-caption-description
                            descriptionElement.classList.add("mt-1"); 
                        }
                        descriptionElement.textContent = descriptionText;
                        slideCaptionWrapper.appendChild(descriptionElement);
                    }

                    imageWrapper.appendChild(slideCaptionWrapper); // Add the caption wrapper to the image wrapper
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
                type: 'carousel',
                startAt: index,
                perView: 1,
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
