#!/usr/bin/env node
/**
 * Scan img/<album>/ (including subfolders) for photos/videos and keep captions.json in sync.
 *
 * Workflow:
 *   1. Drop images/videos into img/<album-name>/ (subfolders OK)
 *   2. Run: npm run sync-photos
 *   3. Edit title/description/alt in that folder's captions.json
 *   4. Rebuild the site
 *
 * Preferred formats:
 *   - Photos: HEIC/HEIF (JPEG kept only when no HEIC sibling exists)
 *   - Video: MOV (MP4 kept only when no MOV sibling exists)
 *
 * Re-running never overwrites non-empty title/description/alt.
 * Use --prune to drop captions.json entries whose files are gone.
 */

const fs = require("fs");
const path = require("path");

const IMG_ROOT = path.join(__dirname, "..", "img");
const MEDIA_EXT = new Set([
	"heic", "heif",
	"jpg", "jpeg", "png", "gif", "webp", "avif",
	"mov",
	"mp4", "webm", "ogg", "m4v",
]);
const SKIP_NAMES = new Set([
	"captions.json",
	"readme.txt",
	".ds_store",
	".gitkeep",
]);
const SKIP_ALBUMS = new Set(["ukulele"]);
const SKIP_DIR_PREFIXES = ["immich-"];

const prune = process.argv.includes("--prune");

function extOf(filename) {
	return filename.toLowerCase().split(".").pop();
}

function isMedia(filename) {
	const lower = filename.toLowerCase();
	if (SKIP_NAMES.has(lower) || lower.startsWith(".")) return false;
	return MEDIA_EXT.has(extOf(filename));
}

function walkFiles(dir, baseDir = dir, out = []) {
	for (const name of fs.readdirSync(dir)) {
		if (SKIP_NAMES.has(name.toLowerCase()) || name.startsWith(".")) continue;
		if (SKIP_DIR_PREFIXES.some((prefix) => name.startsWith(prefix))) continue;
		const full = path.join(dir, name);
		const stat = fs.statSync(full);
		if (stat.isDirectory()) {
			walkFiles(full, baseDir, out);
			continue;
		}
		if (!isMedia(name)) continue;
		out.push(path.relative(baseDir, full).split(path.sep).join("/"));
	}
	return out;
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

/**
 * Prefer HEIC over JPEG/MOV (Live Photo pairs → still only) and MOV over MP4.
 * Standalone MOV files (no HEIC sibling) are kept.
 */
function preferNativeFormats(files, albumDir) {
	const byStem = new Map();
	for (const rel of files) {
		const stem = rel.replace(/\.[^.]+$/, "").toLowerCase();
		if (!byStem.has(stem)) byStem.set(stem, []);
		byStem.get(stem).push(rel);
	}

	const kept = [];
	for (const rels of byStem.values()) {
		const hasHeic = rels.some((r) => ["heic", "heif"].includes(extOf(r)));
		const hasMov = rels.some((r) => extOf(r) === "mov");
		for (const rel of rels) {
			const ext = extOf(rel);
			if (hasHeic && (ext === "jpg" || ext === "jpeg")) continue;
			if (hasHeic && ext === "mov") continue;
			if (hasMov && ext === "mp4") continue;
			kept.push(rel);
		}
	}
	return kept;
}

function syncAlbum(albumDir) {
	const albumName = path.basename(albumDir);
	const captionsPath = path.join(albumDir, "captions.json");
	const discovered = walkFiles(albumDir);
	const files = preferNativeFormats(discovered, albumDir)
		.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

	const existing = loadCaptions(captionsPath);
	const byFile = new Map(existing.map((entry) => [entry.file, entry]));
	const fileSet = new Set(files);
	const next = [];
	const seen = new Set();

	for (const entry of existing) {
		if (!entry?.file || seen.has(entry.file)) continue;
		if (!fileSet.has(entry.file)) {
			if (prune) {
				console.log(`  [${albumName}] prune missing: ${entry.file}`);
				continue;
			}
			next.push(entry);
			seen.add(entry.file);
			continue;
		}
		next.push({
			file: entry.file,
			title: entry.title || "",
			description: entry.description || "",
			alt: entry.alt || "",
		});
		seen.add(entry.file);
	}

	let added = 0;
	for (const file of files) {
		if (seen.has(file) || byFile.has(file)) continue;
		next.push(emptyEntry(file));
		seen.add(file);
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
