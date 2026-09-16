#!/usr/bin/env node
/**
 * Scan img/<album>/ for photos/videos and keep captions.json in sync.
 *
 * Workflow:
 *   1. Drop images into img/<album-name>/
 *   2. Run: npm run sync-photos
 *   3. Edit title/description/alt in that folder's captions.json
 *   4. Rebuild the site — posts pull captions automatically
 *
 * Re-running never overwrites non-empty title/description/alt.
 * Use --prune to drop captions.json entries whose files are gone.
 */

const fs = require("fs");
const path = require("path");

const IMG_ROOT = path.join(__dirname, "..", "img");
const MEDIA_EXT = new Set([
	"jpg", "jpeg", "png", "gif", "webp", "heic", "avif",
	"mp4", "webm", "ogg", "mov", "m4v",
]);
const SKIP_NAMES = new Set([
	"captions.json",
	"readme.txt",
	".ds_store",
	".gitkeep",
]);
const SKIP_ALBUMS = new Set(["ukulele"]);

const prune = process.argv.includes("--prune");

function isMedia(filename) {
	const lower = filename.toLowerCase();
	if (SKIP_NAMES.has(lower)) return false;
	if (lower.startsWith(".")) return false;
	const ext = lower.split(".").pop();
	return MEDIA_EXT.has(ext);
}

function loadCaptions(captionsPath) {
	if (!fs.existsSync(captionsPath)) return [];
	try {
		const raw = JSON.parse(fs.readFileSync(captionsPath, "utf8"));
		if (Array.isArray(raw)) return raw;
		if (Array.isArray(raw.photos)) return raw.photos;
		console.warn(`Unrecognized captions format: ${captionsPath}`);
		return [];
	} catch (err) {
		console.error(`Failed to parse ${captionsPath}:`, err.message);
		process.exit(1);
	}
}

function emptyEntry(file) {
	return { file, title: "", description: "", alt: "" };
}

function syncAlbum(albumDir) {
	const albumName = path.basename(albumDir);
	const captionsPath = path.join(albumDir, "captions.json");
	const files = fs
		.readdirSync(albumDir)
		.filter(isMedia)
		.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

	const existing = loadCaptions(captionsPath);
	const byFile = new Map(existing.map((entry) => [entry.file, entry]));
	const fileSet = new Set(files);

	const next = [];

	// Keep existing order for files that are still present
	for (const entry of existing) {
		if (!fileSet.has(entry.file)) {
			if (prune) {
				console.log(`  [${albumName}] prune missing: ${entry.file}`);
				continue;
			}
			// Keep entry so captions aren't lost if file is temporarily gone
			next.push(entry);
			continue;
		}
		next.push({
			file: entry.file,
			title: entry.title || "",
			description: entry.description || "",
			alt: entry.alt || "",
		});
	}

	// Append newly found files
	let added = 0;
	for (const file of files) {
		if (byFile.has(file)) continue;
		next.push(emptyEntry(file));
		added += 1;
		console.log(`  [${albumName}] added: ${file}`);
	}

	fs.writeFileSync(captionsPath, `${JSON.stringify(next, null, 2)}\n`);
	return { albumName, total: next.length, added };
}

function main() {
	if (!fs.existsSync(IMG_ROOT)) {
		console.error(`Missing img directory: ${IMG_ROOT}`);
		process.exit(1);
	}

	const albums = fs
		.readdirSync(IMG_ROOT, { withFileTypes: true })
		.filter((d) => d.isDirectory())
		.filter((d) => !SKIP_ALBUMS.has(d.name))
		.map((d) => path.join(IMG_ROOT, d.name))
		.sort();

	if (albums.length === 0) {
		console.log("No album folders found under img/");
		return;
	}

	console.log(`Syncing ${albums.length} album folder(s)${prune ? " (prune mode)" : ""}...`);
	let addedTotal = 0;
	for (const albumDir of albums) {
		const result = syncAlbum(albumDir);
		addedTotal += result.added;
		if (result.added === 0) {
			console.log(`  [${result.albumName}] ok (${result.total} entries)`);
		}
	}
	console.log(`Done. ${addedTotal} new file(s) added to captions.json.`);
	console.log("Edit titles/descriptions in each album's captions.json, then rebuild.");
}

main();
