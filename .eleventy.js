const fs = require("fs");

const { DateTime } = require("luxon");
const markdownIt = require("markdown-it");
var markdownItAttrs = require('markdown-it-attrs');
const markdownItFootnote = require("markdown-it-footnote");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginNavigation = require("@11ty/eleventy-navigation");

module.exports = function (eleventyConfig) {
  eleventyConfig.on('eleventy.before', async () => {
    const { compileObservable } = await import("./js/compile.mjs")
    global.compileObservable = compileObservable
  })

  const runtimeOutputPath = "/js/observable-runtime.js"
  const inspectorOutputPath = "/js/inspector.mjs"

  // Copy the `img`, `js` and `css` folders to the output
  eleventyConfig.addPassthroughCopy("img");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("sw.js");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("data-sources");
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPassthroughCopy("manifest.json");

  // Pass through the runtime and inspector to be loaded and run on the client-side
  eleventyConfig.addPassthroughCopy({
    // Use the official Observable runtime
    "node_modules/@observablehq/runtime/dist/runtime.js": runtimeOutputPath,
    // Use our own custom Inspector
    // "utils/ojs/client/inspector.mjs": inspectorOutputPath,
  })

  // Add the OJS format
  eleventyConfig.addTemplateFormats("ojs")
  eleventyConfig.addExtension("ojs", {
    // Compile the notebook to HTML
    compile: async (inputContent) => {
      return async (data) => await compileObservable(inputContent, {
        runtimePath: runtimeOutputPath,
        inspectorPath: inspectorOutputPath,
      })
    }
  })

  // Add plugins
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginSyntaxHighlight);
  eleventyConfig.addPlugin(pluginNavigation);

  eleventyConfig.addFilter("readableDate", dateObj => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat("dd LLL yyyy");
  });

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter('htmlDateString', (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('yyyy-LL-dd');
  });

  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter("head", (array, n) => {
    if (!Array.isArray(array) || array.length === 0) {
      return [];
    }
    if (n < 0) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

  // Return the smallest number argument
  eleventyConfig.addFilter("min", (...numbers) => {
    return Math.min.apply(null, numbers);
  });

  function filterTagList(tags) {
    return (tags || []).filter(tag => ["all", "nav", "post", "posts"].indexOf(tag) === -1);
  }

  eleventyConfig.addFilter("filterTagList", filterTagList)

  // Create an array of all tags
  eleventyConfig.addCollection("tagList", function (collection) {
    let tagSet = new Set();
    collection.getAll().forEach(item => {
      (item.data.tags || []).forEach(tag => tagSet.add(tag));
    });

    return filterTagList([...tagSet]);
  });

  // Customize Markdown library and settings:
  let markdownLibrary = markdownIt({
    html: true,
  })
  markdownLibrary.use(markdownItAttrs, {
    leftDelimiter: '{',
    rightDelimiter: '}',
    allowedAttributes: []
  });
  markdownLibrary.use(markdownItFootnote);
  eleventyConfig.setLibrary("md", markdownLibrary);

  // Override Browsersync defaults (used only with --serve)
  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function (err, browserSync) {
        const content_404 = fs.readFileSync('dist/404.html');

        browserSync.addMiddleware("*", (req, res) => {
          // Provides the 404 content without redirect.
          res.writeHead(404, { "Content-Type": "text/html; charset=UTF-8" });
          res.write(content_404);
          res.end();
        });
      },
    },
    ui: false,
    ghostMode: false
  });

  // Image Shortcode
  eleventyConfig.addShortcode("image", function(options) {
    // Destructure options with defaults
    const { 
      src = '', 
      alt = '', // Alt text for accessibility
      caption = '', // Text for visible caption, may contain delimiter
      alignment = 'none' 
    } = options;

    const validAlignments = ['left', 'right', 'center', 'none'];
    const alignClass = validAlignments.includes(alignment) ? `align-${alignment}` : 'align-none';

    if (!src) {
      console.warn('Image shortcode called without a src parameter.');
      return '';
    }

    // --- Caption Processing Logic --- 
    let captionHtml = '';
    if (caption && caption.trim() !== '') {
      const delimiter = "::";
      let titleText = '';
      let descriptionText = '';
      let captionContentHtml = ''; // Inner HTML for the figcaption

      if (caption.includes(delimiter)) {
          const parts = caption.split(delimiter, 2);
          titleText = parts[0].trim();
          descriptionText = parts[1].trim();
      } else {
          titleText = caption.trim();
      }

      // Build inner HTML for caption using semantic classes
      if (titleText) {
          captionContentHtml += `<span class="image-caption-title">${titleText}</span>`;
      }
      if (descriptionText) {
          // Add spacing if title also exists (can use CSS adjacent sibling selector too)
          const spacingClass = titleText ? " mt-1" : ""; // Or handle purely in CSS
          captionContentHtml += `<span class="image-caption-description${spacingClass}">${descriptionText}</span>`;
      }

      // Wrap content in figcaption only if there's content
      if (captionContentHtml) {
          captionHtml = `<figcaption class="image-shortcode-caption absolute bottom-[0] left-[0] right-[0] p-2 bg-white opacity-70">${captionContentHtml}</figcaption>`;
      }
    }
    // --- End Caption Processing ---

    // Basic image structure
    const imgHtml = `<img src="${src}" alt="${alt}" data-caption="${caption}" loading="lazy" decoding="async">`;

    // Return the full figure HTML
    return `<figure class="tmpl-post image-container ${alignClass} rounded-overflow relative">
              ${imgHtml}
              ${captionHtml}
            </figure>`;
  });

  // Inline Image Carousel Shortcode
  eleventyConfig.addShortcode("imageCarousel", function(options) {
    const { 
      id = `carousel-${Math.random().toString(36).substring(2, 15)}`,
      images = [], // Renamed from 'items' to be clearer
      // Allow overriding default Glide options via shortcode parameters if needed
      glideOptions = {}
    } = options;

    // Changed 'items' to 'images' in the check
    if (!images || images.length === 0) { 
      return '<p>Image carousel requires an array of images or videos.</p>'; // Updated message
    }

    let slidesHtml = '';
    const videoExtensions = ['mp4', 'webm', 'ogg', 'mov']; // Common video extensions

    images.forEach(itemData => { // Changed 'imgData' to 'itemData'
      // Add checks and fallbacks for potentially missing data
      const src = itemData?.src || '';
      const alt = itemData?.alt || ''; // Alt text primarily for images
      const rawCaption = itemData?.caption || ''; 

	  if (!src) return; // Skip if no src

      const fileExtension = src.split('.').pop().toLowerCase();
      const isVideo = videoExtensions.includes(fileExtension);
	  
      // Ensure caption is a string, fallback to alt if it makes sense for the item type, then empty
      const caption = String(rawCaption || (!isVideo ? alt : '') || ''); 


      // --- Caption Processing Logic (mostly same, uses 'caption' variable) ---
      let captionTextHtml = ''; 
      if (caption.trim() !== '') {
          const delimiter = "::";
          let titleText = '';
          let descriptionText = '';

          if (caption.includes(delimiter)) {
              const parts = caption.split(delimiter, 2);
              titleText = parts[0].trim();
              descriptionText = parts[1].trim();
          } else {
              titleText = caption.trim(); 
          }

          if (titleText) {
              captionTextHtml += `<span class="image-caption-title">${titleText}</span>`;
          }
          if (descriptionText) {
              const spacingClass = titleText ? " mt-1" : ""; 
              captionTextHtml += `<span class="image-caption-description${spacingClass}">${descriptionText}</span>`;
          }
      }
      const textContentWrapper = captionTextHtml ? `<div class="caption-text-content">${captionTextHtml}</div>` : '';
      const figcaptionHtml = textContentWrapper ? `<figcaption class="inline-carousel-caption">${textContentWrapper}</figcaption>` : '';
      // --- End Caption Processing ---

      // --- Media Element and Optional Lightbox Structure ---
      let mediaHtml = ''; // Will hold either <img> or <video> tag + wrappers

      // Define the base media element using a ternary
      const mediaElementHtml = isVideo
          ? `<video src="${src}" muted loop playsinline class="carousel-media carousel-video w-full h-auto aspect-video object-cover rounded-t-md" data-caption="${caption}"></video>`
          : `<img src="${src}" alt="${alt}" data-caption="${caption}" loading="lazy" decoding="async" class="carousel-media carousel-image w-full h-auto object-cover">`;

      // Always include the lightbox wrapper and icon for potential lightbox activation
      // The lightbox JS will handle whether to show image or video
      const iconHtml = 
        `<span class="lightbox-indicator-icon absolute top-1 right-1" aria-hidden="true">` + 
          `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9M20.25 20.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>` + 
        `</span>`;

      // Wrap the media element (img or video) and icon in the lightbox wrapper
      mediaHtml = 
        `<div class="lightbox-image-wrapper relative">` + // Renamed class slightly for clarity? Or keep as is?
          `${mediaElementHtml}` +
          `${iconHtml}` +
        `</div>`;
      // --- End Media Element Structure ---

      // Combine into slide content (media element first, then caption)
      // Added base classes for consistency, removed conditional wrapper
      const slideContent = `<div class="relative rounded-overflow bg-gray-100 dark:bg-gray-800 shadow-md">${mediaHtml}${figcaptionHtml}</div>`; 

      slidesHtml += `<li class="glide__slide">${slideContent}</li>`;
    });

    // Define default Glide options for this type of carousel - MATCHING LIGHTBOX
    const defaultOptions = {
      type: 'slider',
      // startAt: 0, // Default is 0, no need to set explicitly unless overriding
      perView: 4,
      gap: 10, // Keep the gap from original inline options
      peek: { before: 50, after: 50 },
      breakpoints: {
          1023: { // Tablet (<= 1023px)
                perView: 2,
                peek: { before: 25, after: 25 } // Slightly less peek
          },
          767: { // Mobile (<= 767px)
              perView: 1,
              peek: 0 // No peek on mobile
          }
      }
    };
    // Merge defaults with any passed-in options
    const finalOptions = { ...defaultOptions, ...glideOptions };

    // Escape double quotes for the HTML attribute value
    const optionsJsonString = JSON.stringify(finalOptions);
    const encodedOptions = optionsJsonString.replace(/"/g, "&quot;");

    // Full Glide HTML structure without arrows
    const carouselHtml = `<div class="glide inline-carousel" id="${id}" data-glide-options="${encodedOptions}">
<div class="glide__track" data-glide-el="track">
<ul class="glide__slides">
${slidesHtml}
</ul>
</div>
<div class="glide__arrows" data-glide-el="controls">
  <button class="glide__arrow glide__arrow--left inline-carousel-arrow" data-glide-dir="<">&#10094;</button>
  <button class="glide__arrow glide__arrow--right inline-carousel-arrow" data-glide-dir=">">&#10095;</button>
</div>
</div>`; // Removed the glide__arrows div -> Now closing the main glide div

    return carouselHtml;
  });

  return {
    // Control which files Eleventy will process
    // e.g.: *.md, *.njk, *.html, *.liquid
    templateFormats: [
      "md",
      "njk",
      "html",
      "liquid"
    ],

    // Pre-process *.md files with: (default: `liquid`)
    markdownTemplateEngine: "njk",

    // Pre-process *.html files with: (default: `liquid`)
    htmlTemplateEngine: "njk",

    // -----------------------------------------------------------------
    // If your site deploys to a subdirectory, change `pathPrefix`.
    // Don't worry about leading and trailing slashes, we normalize these.

    // If you don't have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for link URLs (it does not affect your file structure)
    // Best paired with the `url` filter: https://www.11ty.dev/docs/filters/url/

    // You can also pass this in on the command line using `--pathprefix`

    // Optional (default is shown)
    pathPrefix: "/",
    // -----------------------------------------------------------------

    // These are all optional (defaults are shown):
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "dist"
    },
    passthroughFileCopy: true,
    dataTemplateEngine: "njk"
  };
};
