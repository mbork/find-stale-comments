import assert from 'node:assert/strict';
import test from 'node:test';
import {annotate_lines} from '../index.ts';

test('classifies comment line as comment', () => {
	const [line] = annotate_lines(['// foo'], []);
	assert.equal(line.type, 'comment');
});

test('classifies code line as code', () => {
	const [line] = annotate_lines(['foo()'], []);
	assert.equal(line.type, 'code');
});

test('classifies empty line as empty', () => {
	const [line] = annotate_lines([''], []);
	assert.equal(line.type, 'empty');
});

test('classifies indented comment as comment', () => {
	const [line] = annotate_lines(['    // foo'], []);
	assert.equal(line.type, 'comment');
});

test('classifies inline comment as comment', () => {
	const lines = annotate_lines(['// leading', 'code()', '// inline', 'more_code()'], []);
	assert.equal(lines[2].type, 'comment');
});
