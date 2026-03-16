import assert from 'node:assert/strict';
import test from 'node:test';
import {annotate_lines} from '../index.ts';
import {load_first_file_chunks, load_ante_lines} from './fixture-utils.ts';

test('marks modified line as changed', async () => {
	const contents = await load_ante_lines('code-changed-but-comment-not');
	const chunks = await load_first_file_chunks('code-changed-but-comment-not');
	const [comment_line, code_line] = annotate_lines(contents, chunks);
	assert.equal(comment_line.changed, false);
	assert.equal(code_line.changed, true);
});

test('marks deleted line as changed', async () => {
	const contents = await load_ante_lines('code-deleted');
	const chunks = await load_first_file_chunks('code-deleted');
	const lines = annotate_lines(contents, chunks);
	assert.equal(lines[1].changed, true);
	assert.equal(lines[2].changed, false);
});

test('does not mark added lines in code section (start)', async () => {
	const contents = await load_ante_lines('addition-in-code-at-start');
	const chunks = await load_first_file_chunks('addition-in-code-at-start');
	const lines = annotate_lines(contents, chunks);
	assert.ok(lines.every(l => !l.changed));
});

test('does not mark added lines in code section (middle)', async () => {
	const contents = await load_ante_lines('addition-in-code-in-middle');
	const chunks = await load_first_file_chunks('addition-in-code-in-middle');
	const lines = annotate_lines(contents, chunks);
	assert.ok(lines.every(l => !l.changed));
});

test('does not mark added lines in code section (end)', async () => {
	const contents = await load_ante_lines('addition-in-code-at-end');
	const chunks = await load_first_file_chunks('addition-in-code-at-end');
	const lines = annotate_lines(contents, chunks);
	assert.ok(lines.every(l => !l.changed));
});

test('does not mark added lines in comment section (start)', async () => {
	const contents = await load_ante_lines('addition-in-comment-at-start');
	const chunks = await load_first_file_chunks('addition-in-comment-at-start');
	const lines = annotate_lines(contents, chunks);
	assert.ok(lines.every(l => !l.changed));
});

test('does not mark added lines in comment section (middle)', async () => {
	const contents = await load_ante_lines('addition-in-comment-in-middle');
	const chunks = await load_first_file_chunks('addition-in-comment-in-middle');
	const lines = annotate_lines(contents, chunks);
	assert.ok(lines.every(l => !l.changed));
});

test('does not mark added lines in comment section (end)', async () => {
	const contents = await load_ante_lines('addition-in-comment-at-end');
	const chunks = await load_first_file_chunks('addition-in-comment-at-end');
	const lines = annotate_lines(contents, chunks);
	assert.ok(lines.every(l => !l.changed));
});

test('marks changed comment line as changed', async () => {
	const contents = await load_ante_lines('comment-changed');
	const chunks = await load_first_file_chunks('comment-changed');
	const [comment_line, code_line] = annotate_lines(contents, chunks);
	assert.equal(comment_line.changed, true);
	assert.equal(code_line.changed, false);
});

test('marks both lines as changed when comment and code both changed', async () => {
	const contents = await load_ante_lines('comment-and-code-changed');
	const chunks = await load_first_file_chunks('comment-and-code-changed');
	const [comment_line, code_line] = annotate_lines(contents, chunks);
	assert.equal(comment_line.changed, true);
	assert.equal(code_line.changed, true);
});

test('marks changed inline comment as changed', async () => {
	const contents = await load_ante_lines('inline-comment-changed');
	const chunks = await load_first_file_chunks('inline-comment-changed');
	const lines = annotate_lines(contents, chunks);
	assert.equal(lines[0].changed, false);
	assert.equal(lines[1].changed, false);
	assert.equal(lines[2].changed, true);
	assert.equal(lines[3].changed, false);
});

test('handles empty chunks', async () => {
	const contents = await load_ante_lines('code-changed-but-comment-not');
	const lines = annotate_lines(contents, []);
	assert.ok(lines.every(l => !l.changed));
});
