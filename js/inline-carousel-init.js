document.addEventListener('DOMContentLoaded', function() {
    const inlineCarousels = document.querySelectorAll('.inline-carousel');
    
    if (inlineCarousels.length === 0) {
        return; // No carousels found on this page
    }

    if (typeof Glide === 'undefined') {
        console.error("Glide library is not loaded. Cannot initialize inline carousels.");
        return;
    }

    inlineCarousels.forEach(carouselElement => {
        const carouselId = carouselElement.id;
        const optionsString = carouselElement.dataset.glideOptions;
		console.log(optionsString);
        let options = {};

        if (!carouselId) {
            console.warn("Inline carousel found without an ID. Skipping initialization.", carouselElement);
            return;
        }

        try {
            // Browser automatically decodes HTML entities from data attributes
            options = optionsString ? JSON.parse(optionsString) : {};
        } catch (e) {
            console.error(`Error parsing Glide options for carousel ID ${carouselId}:`, e, optionsString);
            options = {}; // Use default Glide options if parsing fails
        }

        // console.log(`Initializing carousel #${carouselId} with options:`, options);
        new Glide(carouselElement, options).mount();
    });
}); 