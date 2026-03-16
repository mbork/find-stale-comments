import fs from 'node:fs/promises';
import path from 'node:path';
import parseDiff from 'parse-diff';
import type parseDiffType from 'parse-diff';

export const fixturesDir = path.join(import.meta.dirname, 'fixtures');

export async function load_patch_files(name: string): Promise<parseDiffType.File[]> {
	const patch = await fs.readFile(path.join(fixturesDir, `${name}.patch`), 'utf-8');
	return parseDiff(patch);
}

export async function load_first_file_chunks(name: string): Promise<parseDiffType.Chunk[]> {
	const files = await load_patch_files(name);
	return files[0].chunks;
}

export async function load_ante_text(name: string): Promise<string> {
	return fs.readFile(path.join(fixturesDir, `${name}.ante.js`), 'utf-8');
}

export async function load_ante_lines(name: string): Promise<string[]> {
	const text = await load_ante_text(name);
	return text.split('\n');
}
