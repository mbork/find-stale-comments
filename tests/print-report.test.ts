import assert from 'node:assert/strict';
import test from 'node:test';
import {print_report} from '../index.ts';
import type {FileReport} from '../index.ts';

test('returns null for empty reports', () => {
	assert.equal(print_report([]), null);
});

test('formats report for two files', () => {
	const reports: FileReport[] = [
		{
			filename: 'calculator.js',
			stale: [{
				comment_line_no: 1,
				comment: ['// add two numbers'],
				offending_line_no: 2,
				offending_line: 'return a - b;',
			}],
		},
		{
			filename: 'parser.js',
			stale: [{
				comment_line_no: 5,
				comment: ['// tokenize input'],
				offending_line_no: 6,
				offending_line: 'return [];',
			}],
		},
	];

	const expected = [
		'======== `find-stale-comments` found comments which should be updated',
		'',
		'=== calculator.js:1',
		'1: // add two numbers',
		'2: return a - b;',
		'',
		'=== parser.js:5',
		'5: // tokenize input',
		'6: return [];',
	].join('\n');

	const actual = print_report(reports);
	assert.equal(actual, expected);
});
