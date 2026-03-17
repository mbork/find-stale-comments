import assert from 'node:assert/strict';
import test from 'node:test';
import {find_stale_comments} from '../index.ts';
import type {OldLine} from '../index.ts';

// * No stale comments

test('returns empty when code changed but no comment precedes it', () => {
	const lines: OldLine[] = [
		{content: 'some_code()', type: 'code', changed: true},
	];
	assert.deepEqual(find_stale_comments(lines), []);
});

test('returns empty when comment was changed', () => {
	const lines: OldLine[] = [
		{content: '// a comment', type: 'comment', changed: true},
		{content: 'some_code()', type: 'code', changed: false},
	];
	assert.deepEqual(find_stale_comments(lines), []);
});

test('returns empty when both comment and code were changed', () => {
	const lines: OldLine[] = [
		{content: '// a comment', type: 'comment', changed: true},
		{content: 'some_code()', type: 'code', changed: true},
	];
	assert.deepEqual(find_stale_comments(lines), []);
});

test('returns empty when only additions were made in code section', () => {
	const lines: OldLine[] = [
		{content: '// a comment', type: 'comment', changed: false},
		{content: 'first_code()', type: 'code', changed: false},
		{content: 'second_code()', type: 'code', changed: false},
	];
	assert.deepEqual(find_stale_comments(lines), []);
});

test('returns empty when only additions were made in comment section', () => {
	const lines: OldLine[] = [
		{content: '// first comment', type: 'comment', changed: false},
		{content: '// second comment', type: 'comment', changed: false},
		{content: 'some_code()', type: 'code', changed: false},
	];
	assert.deepEqual(find_stale_comments(lines), []);
});

test('returns empty when changed code follows comment after an empty line', () => {
	const lines: OldLine[] = [
		{content: '// a comment', type: 'comment', changed: false},
		{content: 'some_code()', type: 'code', changed: false},
		{content: '', type: 'empty', changed: false},
		{content: 'other_code()', type: 'code', changed: true},
	];
	assert.deepEqual(find_stale_comments(lines), []);
});

test('returns empty when comment is at end of file', () => {
	const lines: OldLine[] = [
		{content: '// updated comment', type: 'comment', changed: true},
		{content: 'some_code()', type: 'code', changed: true},
		{content: '', type: 'empty', changed: false},
		{content: '// a comment', type: 'comment', changed: false},
	];
	assert.deepEqual(find_stale_comments(lines), []);
});

test('returns empty when comment is followed directly by an empty line', () => {
	const lines: OldLine[] = [
		{content: '// a comment', type: 'comment', changed: false},
		{content: '', type: 'empty', changed: false},
		{content: 'some_code()', type: 'code', changed: true},
	];
	assert.deepEqual(find_stale_comments(lines), []);
});

test('returns empty when only part of a multi-line comment was changed', () => {
	const lines: OldLine[] = [
		{content: '// line 1', type: 'comment', changed: false},
		{content: '// line 2', type: 'comment', changed: true},
		{content: 'some_code()', type: 'code', changed: true},
	];
	assert.deepEqual(find_stale_comments(lines), []);
});

// * Stale comments detected

test('detects stale multi-line comment', () => {
	const lines: OldLine[] = [
		{content: '// line 1', type: 'comment', changed: false},
		{content: '// line 2', type: 'comment', changed: false},
		{content: 'some_code()', type: 'code', changed: true},
	];
	assert.deepEqual(find_stale_comments(lines), [{
		comment_line_no: 1,
		comment: ['// line 1', '// line 2'],
		offending_line_no: 3,
		offending_line: 'some_code()',
	}]);
});

test('detects stale comment when code changed but comment not', () => {
	const lines: OldLine[] = [
		{content: '// a comment', type: 'comment', changed: false},
		{content: 'some_code()', type: 'code', changed: true},
	];
	assert.deepEqual(find_stale_comments(lines), [{
		comment_line_no: 1,
		comment: ['// a comment'],
		offending_line_no: 2,
		offending_line: 'some_code()',
	}]);
});

test('detects stale comment when first code line is deleted', () => {
	const lines: OldLine[] = [
		{content: '// a comment', type: 'comment', changed: false},
		{content: 'first_code()', type: 'code', changed: true},
		{content: 'second_code()', type: 'code', changed: false},
	];
	assert.deepEqual(find_stale_comments(lines), [{
		comment_line_no: 1,
		comment: ['// a comment'],
		offending_line_no: 2,
		offending_line: 'first_code()',
	}]);
});

test('scans past unchanged code lines to find first changed code line', () => {
	const lines: OldLine[] = [
		{content: '// a comment', type: 'comment', changed: false},
		{content: 'first_code()', type: 'code', changed: false},
		{content: 'second_code()', type: 'code', changed: false},
		{content: 'third_code()', type: 'code', changed: true},
	];
	assert.deepEqual(find_stale_comments(lines), [{
		comment_line_no: 1,
		comment: ['// a comment'],
		offending_line_no: 4,
		offending_line: 'third_code()',
	}]);
});

test('detects stale when changed comment line follows unchanged code block', () => {
	const lines: OldLine[] = [
		{content: '// a comment', type: 'comment', changed: false},
		{content: 'some_code()', type: 'code', changed: false},
		{content: '// inline', type: 'comment', changed: true},
		{content: 'other_code()', type: 'code', changed: false},
	];
	assert.deepEqual(find_stale_comments(lines), [{
		comment_line_no: 1,
		comment: ['// a comment'],
		offending_line_no: 3,
		offending_line: '// inline',
	}]);
});

// * Multiple blocks

// Verifies that the outer loop resumes correctly after a clean (non-stale)
// comment+code block: the code-scan loop leaves i on the empty line, and the
// outer loop must still pick up the next comment block.
test('detects stale comment after a clean comment+code block', () => {
	const lines: OldLine[] = [
		{content: '// first comment', type: 'comment', changed: false},
		{content: 'first_code()', type: 'code', changed: false},
		{content: '', type: 'empty', changed: false},
		{content: '// second comment', type: 'comment', changed: false},
		{content: 'second_code()', type: 'code', changed: true},
	];
	assert.deepEqual(find_stale_comments(lines), [{
		comment_line_no: 4,
		comment: ['// second comment'],
		offending_line_no: 5,
		offending_line: 'second_code()',
	}]);
});

test('reports multiple stale comment blocks', () => {
	const lines: OldLine[] = [
		{content: '// first comment', type: 'comment', changed: false},
		{content: 'first_code()', type: 'code', changed: true},
		{content: '', type: 'empty', changed: false},
		{content: '// second comment', type: 'comment', changed: false},
		{content: 'second_code()', type: 'code', changed: true},
	];
	assert.deepEqual(find_stale_comments(lines), [
		{
			comment_line_no: 1,
			comment: ['// first comment'],
			offending_line_no: 2,
			offending_line: 'first_code()',
		},
		{
			comment_line_no: 4,
			comment: ['// second comment'],
			offending_line_no: 5,
			offending_line: 'second_code()',
		},
	]);
});
