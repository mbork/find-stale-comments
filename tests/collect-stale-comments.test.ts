import assert from 'node:assert/strict';
import test from 'node:test';
import type parseDiffType from 'parse-diff';
import {collect_stale_comments} from '../index.ts';
import {load_patch_files, load_ante_text} from './fixture-utils.ts';

// * Skipped files

test('skips new files', () => {
	const files: parseDiffType.File[] = [
		{chunks: [], deletions: 0, additions: 1, from: 'calculator.js', new: true},
	];
	const contents = new Map([['calculator.js', '// add two numbers\nreturn a + b;']]);
	assert.deepEqual(collect_stale_comments(files, contents), []);
});

test('skips files with no `from`', () => {
	const files: parseDiffType.File[] = [
		{chunks: [], deletions: 0, additions: 0},
	];
	assert.deepEqual(collect_stale_comments(files, new Map()), []);
});

test('skips files missing from contents map', async () => {
	const files = await load_patch_files('code-changed-but-comment-not');
	assert.deepEqual(collect_stale_comments(files, new Map()), []);
});

// * No stale comments

test('returns empty when comment was updated alongside code', async () => {
	const files = await load_patch_files('comment-changed');
	const contents = new Map([[files[0].from!, await load_ante_text('comment-changed')]]);
	assert.deepEqual(collect_stale_comments(files, contents), []);
});

// * Stale comment detected

test('returns FileReport with correct filename and stale entry', async () => {
	const files = await load_patch_files('code-changed-but-comment-not');
	const contents = new Map([[files[0].from!, await load_ante_text('code-changed-but-comment-not')]]);
	const reports = collect_stale_comments(files, contents);
	assert.equal(reports.length, 1);
	assert.equal(reports[0].filename, files[0].from);
	assert.equal(reports[0].stale.length, 1);
	assert.deepEqual(reports[0].stale[0].comment, ['// Say hello to the world']);
	assert.equal(reports[0].stale[0].offending_line, "console.log('Hello world!');");
});
