document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded and parsed");
    const images = document.querySelectorAll("img");
    console.log(`Found ${images.length} images`);
    const lightbox = document.createElement("div");
    lightbox.classList.add("lightbox", "fixed", "inset-0", "bg-black", "bg-opacity-75", "flex", "flex-col", "items-center", "justify-center", "z-50", "hidden");
    document.body.appendChild(lightbox);

    const img = document.createElement("img");
    img.classList.add("lightbox-content", "w-full", "h-auto", "object-contain");
    lightbox.appendChild(img);

    const caption = document.createElement("div");
    caption.classList.add("text-white", "text-center", "mt-4", "w-full");
    lightbox.appendChild(caption);

    const close = document.createElement("span");
    close.classList.add("close", "absolute", "top-0", "right-0", "m-4", "text-white", "text-2xl", "cursor-pointer");
    close.innerHTML = "&times;";
    lightbox.appendChild(close);

    const prev = document.createElement("span");
    prev.classList.add("prev", "absolute", "top-1/2", "left-0", "transform", "-translate-y-1/2", "m-4", "text-white", "text-2xl", "cursor-pointer");
    prev.innerHTML = "&#10094;";
    lightbox.appendChild(prev);

    const next = document.createElement("span");
    next.classList.add("next", "absolute", "top-1/2", "right-0", "transform", "-translate-y-1/2", "m-4", "text-white", "text-2xl", "cursor-pointer");
    next.innerHTML = "&#10095;";
    lightbox.appendChild(next);

    if (images.length <= 1) {
        prev.style.display = "none";
        next.style.display = "none";
    }

    let currentIndex = 0;

    function showImage(index) {
        const image = images[index];
        img.src = image.src;
        caption.textContent = image.alt;
        currentIndex = index;
    }

    images.forEach((image, index) => {
        console.log(`Adding click listener for ${image.src}`);
        image.addEventListener("click", () => {
            console.log(`Image clicked: ${image.src}`);
            lightbox.style.display = "flex";
            showImage(index);
        });
    });

    close.addEventListener("click", () => {
        console.log("Close button clicked");
        lightbox.style.display = "none";
    });

    prev.addEventListener("click", () => {
        console.log("Previous button clicked");
        showImage((currentIndex - 1 + images.length) % images.length);
    });

    next.addEventListener("click", () => {
        console.log("Next button clicked");
        showImage((currentIndex + 1) % images.length);
    });

    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) {
            console.log("Lightbox background clicked");
            lightbox.style.display = "none";
        }
    });
});
