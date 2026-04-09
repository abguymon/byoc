#!/usr/bin/env node
/**
 * Optimize photos for web: resize to max 1920px wide, convert to WebP at quality 82.
 * Usage: node scripts/optimize-photos.mjs <input-dir> [output-dir]
 *
 * Output defaults to <input-dir>/optimized/
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const [inputDir, outputDir] = process.argv.slice(2);

if (!inputDir) {
  console.error('Usage: node scripts/optimize-photos.mjs <input-dir> [output-dir]');
  process.exit(1);
}

const outDir = outputDir ?? path.join(inputDir, 'optimized');
fs.mkdirSync(outDir, { recursive: true });

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const files = fs.readdirSync(inputDir).filter(f => IMAGE_EXTS.has(path.extname(f).toLowerCase()));

if (files.length === 0) {
  console.log('No image files found in', inputDir);
  process.exit(0);
}

console.log(`Processing ${files.length} images → ${outDir}\n`);

for (const file of files) {
  const inPath = path.join(inputDir, file);
  const outName = path.basename(file, path.extname(file)) + '.webp';
  const outPath = path.join(outDir, outName);

  const { size: sizeBefore } = fs.statSync(inPath);

  await sharp(inPath)
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(outPath);

  const { size: sizeAfter } = fs.statSync(outPath);
  const pct = Math.round((1 - sizeAfter / sizeBefore) * 100);
  console.log(`  ${file} → ${outName}  (${kb(sizeBefore)} → ${kb(sizeAfter)}, -${pct}%)`);
}

console.log('\nDone.');

function kb(bytes) {
  return Math.round(bytes / 1024) + 'KB';
}
