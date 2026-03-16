import simpleGit from 'simple-git';
import parseDiff from 'parse-diff';

// * Types

export interface OldLine {
	content: string;
	type: 'comment' | 'code' | 'empty';
	changed: boolean;
}

export interface StaleComment {
	comment_line_no: number; // 1-based line number of the comment block start
	comment: string[]; // lines of the comment block
	offending_line_no: number; // 1-based line number of the changed code line
	offending_line: string; // the changed code line that triggered the warning
}

export interface FileReport {
	filename: string;
	stale: StaleComment[];
}

// * Core logic

// Matches lines whose first non-whitespace characters are a comment marker:
// //, #, --, ; or %
export function is_comment(line: string): boolean {
	return /^\s*(\/\/|#|--|;|%)/.test(line);
}

// Classify each line by type and mark deleted lines (from the diff) as changed.
export function annotate_lines(contents: string[], chunks: parseDiff.Chunk[]): OldLine[] {
	const lines: OldLine[] = contents.map(content => ({
		content,
		type: content.trim() === '' ? 'empty' : is_comment(content) ? 'comment' : 'code',
		changed: false,
	}));
	for (const chunk of chunks) {
		for (const change of chunk.changes) {
			if (change.type === 'del') {
				lines[change.ln - 1].changed = true;
			}
		}
	}
	return lines;
}

// Returns stale comment blocks: consecutive comment lines where none were
// changed, but the following code block was changed.
export function find_stale_comments(lines: OldLine[]): StaleComment[] {
	const stale: StaleComment[] = [];
	let i = 0;

	// Iterate over all lines
	while (i < lines.length) {
		// Find the beginning of a comment
		if (lines[i].type !== 'comment') {
			i++;
			continue;
		}

		// Collect the comment and check if any line in it changed.
		const comment_state = {
			line_no: i + 1,
			content: [] as string[],
			changed: false,
		};
		while (i < lines.length && lines[i].type === 'comment') {
			if (lines[i].changed) {
				comment_state.changed = true;
			}
			comment_state.content.push(lines[i].content);
			i++;
		}

		// If the comment was untouched, check if the following code was changed.
		if (!comment_state.changed) {
			while (i < lines.length && lines[i].type !== 'empty') {
				if (lines[i].changed) {
					stale.push({
						comment_line_no: comment_state.line_no,
						comment: comment_state.content,
						offending_line_no: i + 1,
						offending_line: lines[i].content,
					});
					break;
				}
				i++;
			}
		}
	}
	return stale;
}

// Fetches the pre-change content of each modified file from HEAD via git.
async function fetch_old_contents(
	files: parseDiff.File[],
	git: ReturnType<typeof simpleGit>,
): Promise<Map<string, string>> {
	const contents = new Map<string, string>();
	for (const file of files) {
		if (file.new || !file.from) {
			continue;
		}
		try {
			const content = await git.show([`HEAD:${file.from}`]);
			contents.set(file.from, content);
		}
		catch {
			// File not in HEAD (e.g. untracked rename source); skip it.
		}
	}
	return contents;
}

// Pure function: given parsed diff files and a map of old file contents,
// returns one FileReport per file that has stale comments.
export function collect_stale_comments(
	files: parseDiff.File[],
	contents: Map<string, string>,
): FileReport[] {
	const reports: FileReport[] = [];
	for (const file of files) {
		if (file.new || !file.from) {
			continue;
		}
		const old_content = contents.get(file.from);
		if (old_content === undefined) {
			continue;
		}
		const lines = annotate_lines(old_content.split('\n'), file.chunks);
		const stale = find_stale_comments(lines);
		if (stale.length > 0) {
			reports.push({filename: file.from, stale});
		}
	}
	return reports;
}

// Formats a report of stale comments as a string, or returns null if empty.
export function print_report(reports: FileReport[]): string | null {
	if (reports.length === 0) {
		return null;
	}
	const lines: string[] = [
		'======== `find-stale-comments` found comments which should be updated',
	];
	for (const {filename, stale} of reports) {
		const line_no_width = String(
			stale[stale.length - 1].offending_line_no,
		).length;
		const fmt_line_no = (n: number) => String(n).padStart(line_no_width);
		for (const s of stale) {
			lines.push('');
			lines.push(`=== ${filename}:${s.comment_line_no}`);
			for (const [i, line] of s.comment.entries()) {
				lines.push(`${fmt_line_no(s.comment_line_no + i)}: ${line}`);
			}
			if (s.offending_line_no > s.comment_line_no + s.comment.length) {
				lines.push('...');
			}
			lines.push(`${fmt_line_no(s.offending_line_no)}: ${s.offending_line}`);
		}
	}
	return lines.join('\n');
}

// * Main

async function main(): Promise<void> {
	const git = simpleGit();
	const diff = await git.diff(['--staged', '--no-ext-diff', '--no-color']);
	const files = parseDiff(diff);
	const contents = await fetch_old_contents(files, git);
	const reports = collect_stale_comments(files, contents);
	const report = print_report(reports);
	if (report !== null) {
		process.stderr.write(report + '\n');
		process.exit(1);
	}
}

if (import.meta.main) {
	main();
}
