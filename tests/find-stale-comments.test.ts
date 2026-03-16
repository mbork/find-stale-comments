import assert from 'node:assert/strict';
import test from 'node:test';
import {find_stale_comments} from '../index.ts';
import type {OldLine} from '../index.ts';

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
