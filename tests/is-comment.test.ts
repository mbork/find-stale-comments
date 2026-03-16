import assert from 'node:assert/strict';
import test from 'node:test';
import {is_comment} from '../index.ts';

test('// with text is a comment', () => {
	assert.equal(is_comment('// update the counter'), true);
});

test('# with text is a comment', () => {
	assert.equal(is_comment('# update the counter'), true);
});

test('-- with text is a comment', () => {
	assert.equal(is_comment('-- select all rows'), true);
});

test('; with text is a comment', () => {
	assert.equal(is_comment('; set register value'), true);
});

test('% with text is a comment', () => {
	assert.equal(is_comment('% define variable'), true);
});

test('/* is not a comment', () => {
	assert.equal(is_comment('/* block comment start */'), false);
});

test('leading whitespace before // is a comment', () => {
	assert.equal(is_comment('    // indented comment'), true);
});

test('plain code line is not a comment', () => {
	assert.equal(is_comment('increment_counter()'), false);
});

test('empty string is not a comment', () => {
	assert.equal(is_comment(''), false);
});

test('whitespace-only string is not a comment', () => {
	assert.equal(is_comment('   '), false);
});

test('code followed by // is not a comment', () => {
	assert.equal(is_comment('increment_counter() // update the counter'), false);
});

test('code followed by # is not a comment', () => {
	assert.equal(is_comment('increment_counter() # update the counter'), false);
});
