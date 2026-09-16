const fs = require("fs");
const path = require("path");

const IMG_ROOT = path.join(__dirname, "..", "img");
const CAPTIONS_FILE = "captions.json";

/**
 * Load img/<album>/captions.json for every album folder.
 * Each entry becomes { src, alt, caption } for the imageCarousel shortcode.
 */
module.exports = function () {
	const albums = {};

	if (!fs.existsSync(IMG_ROOT)) {
		return albums;
	}

	for (const name of fs.readdirSync(IMG_ROOT)) {
		const albumDir = path.join(IMG_ROOT, name);
		if (!fs.statSync(albumDir).isDirectory()) continue;

		const captionsPath = path.join(albumDir, CAPTIONS_FILE);
		if (!fs.existsSync(captionsPath)) {
			albums[name] = [];
			continue;
		}

		let entries;
		try {
			entries = JSON.parse(fs.readFileSync(captionsPath, "utf8"));
		} catch (err) {
			console.warn(`[photoAlbums] bad JSON in ${captionsPath}: ${err.message}`);
			albums[name] = [];
			continue;
		}

		if (!Array.isArray(entries)) {
			albums[name] = [];
			continue;
		}

		albums[name] = entries
			.filter((entry) => entry && entry.file)
			.filter((entry) => fs.existsSync(path.join(albumDir, entry.file)))
			.map((entry) => {
				const title = (entry.title || "").trim();
				const description = (entry.description || "").trim();
				const alt = (entry.alt || title || entry.file).trim();
				let caption = "";
				if (title && description) caption = `${title}::${description}`;
				else if (title) caption = title;
				else if (description) caption = description;

				return {
					src: `/img/${name}/${entry.file}`,
					alt,
					caption,
				};
			});
	}

	return albums;
};
