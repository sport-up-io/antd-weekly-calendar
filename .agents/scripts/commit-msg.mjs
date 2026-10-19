#!/usr/bin/env node
/**
 * Hook git `commit-msg` des repos Sport Up : réécrit chaque message de commit au format
 * Conventional Commits + gitmoji, en français, avec une liste à puces détaillée générée depuis le diff.
 *
 * Source : sportup-core/.agents/shared/scripts/commit-msg.mjs, installée par `npm run agents:sync`
 * dans `.agents/scripts/` et appelée par `.git/hooks/commit-msg`.
 *
 * Génération : Claude Code en mode non interactif (`claude -p`, modèle Haiku, sans outils), lancé hors du repo.
 * Le diff part donc chez Anthropic, sauf s'il contient un secret reconnaissable : il n'est alors pas envoyé.
 * Si la génération échoue, le message d'origine est gardé, avec au moins le gitmoji ajouté.
 * Le hook ne bloque jamais un commit.
 *
 * Désactivation ponctuelle : SPORTUP_COMMIT_AI=0 git commit …
 * Binaire Claude imposé : SPORTUP_CLAUDE_BIN=<chemin>
 */
import {spawnSync} from 'node:child_process';
import {existsSync, readdirSync, readFileSync, writeFileSync} from 'node:fs';
import {homedir, tmpdir} from 'node:os';
import {basename, join} from 'node:path';

const MESSAGE_FILE = process.argv[2];
const MODEL = 'haiku';
const GENERATION_TIMEOUT_MS = 90_000;
const MAX_DIFF_LENGTH = 40_000;
const SCISSORS = '------------------------ >8 ------------------------';

const GITMOJI = {feat: '✨', fix: '🐛', refactor: '♻️', perf: '⚡️', test: '✅', docs: '📝', style: '🎨', chore: '🔧', build: '📦️', ci: '👷', revert: '⏪️'};
const TYPES = Object.keys(GITMOJI).join('|');
const HEADER = new RegExp(`^(${TYPES})(\\([\\w./-]+\\))?!?: \\S+ \\S.{2,}$`, 'u');
const CONVENTIONAL = new RegExp(`^(${TYPES})(\\([\\w./-]+\\))?(!?): *(.*)$`, 'u');
const TRAILER = /^[A-Z][\w-]+: \S/;

/** Fichiers sans intérêt pour décrire le changement, ou qui ne doivent jamais quitter la machine. */
const EXCLUDED_PATHS = ['package-lock.json', 'yarn.lock', '**/generated/**', 'dist/**', '.claude/**', '.agents/scripts/**', '**/.env*', '**/*.pem', '**/*.key', '**/credentials*'];
const SECRET_VALUES = [/\b[rs]k_(live|test)_[0-9a-zA-Z]{16,}/, /\bwhsec_[0-9a-zA-Z]{16,}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /\bglpat-[0-9a-zA-Z_-]{20,}/, /\bAKIA[0-9A-Z]{16}\b/];

const PROMPT = `Tu rédiges le message de commit git d'un changement du projet Sport Up (repo « {repo} », branche « {branch} »).

Format STRICT, sans rien d'autre (pas de bloc de code, pas d'introduction, pas de conclusion) :

<type>(<scope optionnel>): <gitmoji> <description>

- <détail 1>
- <détail 2>

Règles :
- Tout en FRANÇAIS. Jamais d'anglais, sauf les identifiants de code entre backticks.
- type parmi : feat ✨, fix 🐛, refactor ♻️, perf ⚡️, test ✅, docs 📝, style 🎨, chore 🔧, build 📦️, ci 👷, revert ⏪️. Migration Hasura : feat(db) avec 🗃️ à la place de ✨.
- Le gitmoji du type juste après les deux-points.
- scope : le domaine métier ou technique principal, en minuscules (bookings, games, auth, db, agents…), omis s'il n'est pas évident.
- description : à l'impératif, sans majuscule initiale ni point final, 72 caractères max pour toute la première ligne.
- Puis une ligne vide, puis 2 à 6 puces « - » qui détaillent les modifications concrètes (quoi et pourquoi), une idée par puce, 100 caractères max par ligne.
- Décris ce que fait réellement le diff ; le message proposé par l'auteur n'est qu'un indice.

Message proposé par l'auteur :
{message}

Fichiers modifiés :
{stat}

Diff :
{diff}`;

function git(args) {
	const result = spawnSync('git', args, {encoding: 'utf-8', maxBuffer: 64 * 1024 * 1024});
	return result.status === 0 ? result.stdout : '';
}

/** Retire les commentaires git et tout ce qui suit la ligne « ciseaux » de `git commit -v`. */
function cleanMessage(raw) {
	const lines = raw.split(/\r?\n/);
	const scissors = lines.findIndex((line) => line.includes(SCISSORS));
	return (scissors === -1 ? lines : lines.slice(0, scissors))
		.filter((line) => !line.startsWith('#'))
		.join('\n')
		.trim();
}

/** Sépare les trailers (`Co-Authored-By: …`, `Refs: …`) du reste, pour les conserver tels quels. */
function splitTrailers(message) {
	const lines = message.split('\n');
	let start = lines.length;
	while (start > 1 && TRAILER.test(lines[start - 1])) {
		start--;
	}
	const hasTrailers = start < lines.length && (start === 0 || lines[start - 1].trim() === '');
	return hasTrailers ? {body: lines.slice(0, start).join('\n').trim(), trailers: lines.slice(start)} : {body: message, trailers: []};
}

function shouldSkip(message) {
	const gitDir = git(['rev-parse', '--git-dir']).trim();
	const inProgress = ['MERGE_HEAD', 'rebase-merge', 'rebase-apply', 'CHERRY_PICK_HEAD', 'REVERT_HEAD'].some((name) => existsSync(join(gitDir, name)));
	return process.env.SPORTUP_COMMIT_AI === '0' || inProgress || /^(Merge |Revert "|fixup!|squash!|amend!)/.test(message);
}

/** Diff du commit en préparation ; pour un `--amend` sans rien d'indexé, celui du commit amendé. */
function stagedChanges() {
	const exclusions = EXCLUDED_PATHS.map((path) => `:(exclude,glob)${path}`);
	const range = git(['diff', '--cached', '--name-only']).trim() ? ['--cached'] : ['--cached', 'HEAD~1'];
	const stat = git(['diff', ...range, '--stat', '--', '.', ...exclusions]).trim();
	const diff = git(['diff', ...range, '--no-color', '--', '.', ...exclusions]);
	return {stat, diff: diff.length > MAX_DIFF_LENGTH ? `${diff.slice(0, MAX_DIFF_LENGTH)}\n[… diff tronqué]` : diff};
}

const compareVersions = (a, b) => b.localeCompare(a, undefined, {numeric: true});

/** Binaire Claude Code : variable d'environnement, PATH, puis extension VS Code ou Antigravity la plus récente. */
function findClaude() {
	if (process.env.SPORTUP_CLAUDE_BIN) {
		return process.env.SPORTUP_CLAUDE_BIN;
	}
	const exe = process.platform === 'win32' ? 'claude.exe' : 'claude';
	const local = join(homedir(), '.local', 'bin', exe);
	if (existsSync(local)) {
		return local;
	}
	if (spawnSync('claude', ['--version'], {encoding: 'utf-8', shell: true}).status === 0) {
		return 'claude';
	}
	for (const editor of ['.antigravity-ide', '.antigravity', '.vscode', '.cursor']) {
		const extensions = join(homedir(), editor, 'extensions');
		const candidates = existsSync(extensions) ? readdirSync(extensions).filter((name) => name.startsWith('anthropic.claude-code-')).sort(compareVersions) : [];
		const binary = candidates.map((name) => join(extensions, name, 'resources', 'native-binary', exe)).find(existsSync);
		if (binary) {
			return binary;
		}
	}
	return null;
}

function generate(prompt) {
	const claude = findClaude();
	if (!claude) {
		return {error: 'Claude Code introuvable (définir SPORTUP_CLAUDE_BIN)'};
	}
	const env = {...process.env};
	delete env.CLAUDECODE;
	delete env.CLAUDE_CODE_ENTRYPOINT;
	const viaShell = claude === 'claude';
	// Sans outils : le modèle ne fait que rédiger. Via le shell, la chaîne vide doit être citée.
	const args = ['-p', '--model', MODEL, '--tools', viaShell ? '""' : '', '--strict-mcp-config', '--no-session-persistence', '--setting-sources', 'user', '--output-format', 'text'];
	// Lancé hors du repo : ni CLAUDE.md, ni réglages, ni hooks du projet.
	const result = spawnSync(claude, args, {input: prompt, cwd: tmpdir(), env, encoding: 'utf-8', timeout: GENERATION_TIMEOUT_MS, shell: viaShell});
	return result.status === 0 ? {output: result.stdout} : {error: result.error?.message ?? result.stderr.trim().split('\n').pop() ?? `code ${result.status}`};
}

/** Garde la sortie du modèle seulement si elle respecte exactement le format attendu. */
function parseGenerated(output) {
	const lines = output.replaceAll(/^```\w*$/gm, '').trim().split(/\r?\n/).map((line) => line.trimEnd());
	const [header, ...rest] = lines;
	const bullets = rest.filter((line) => line.trim() !== '').map((line) => line.replace(/^\s*[*•]\s+/, '- '));
	const valid = HEADER.test(header ?? '') && header.length <= 100 && bullets.length > 0 && bullets.every((line) => line.startsWith('- ') || line.startsWith('  '));
	return valid ? `${header}\n\n${bullets.join('\n')}` : null;
}

/** Repli sans modèle : ajoute le gitmoji du type s'il manque. */
function withGitmoji(message) {
	const [header, ...rest] = message.split('\n');
	const match = CONVENTIONAL.exec(header);
	if (!match || HEADER.test(header)) {
		return message;
	}
	const [, type, scope = '', breaking, description] = match;
	return [`${type}${scope}${breaking}: ${GITMOJI[type]} ${description}`, ...rest].join('\n');
}

function main() {
	const original = cleanMessage(readFileSync(MESSAGE_FILE, 'utf-8'));
	if (!original || shouldSkip(original)) {
		return;
	}
	const {body, trailers} = splitTrailers(original);
	const {stat, diff} = stagedChanges();
	let rewritten = null;
	if (!diff.trim()) {
		process.stderr.write('commit-msg : diff vide, message conservé.\n');
	} else if (SECRET_VALUES.some((pattern) => pattern.test(diff))) {
		process.stderr.write('commit-msg : secret détecté dans le diff, rien n\'est envoyé au modèle. Vérifier les fichiers indexés !\n');
	} else {
		const repo = basename(git(['rev-parse', '--show-toplevel']).trim());
		const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']).trim();
		const values = {repo, branch, message: body, stat, diff};
		const {output, error} = generate(PROMPT.replaceAll(/\{(\w+)\}/g, (_match, key) => values[key]));
		rewritten = output ? parseGenerated(output) : null;
		if (!rewritten) {
			process.stderr.write(`commit-msg : génération impossible (${error ?? 'format invalide'}), message d'origine conservé.\n`);
		}
	}
	const final = [rewritten ?? withGitmoji(body), ...(trailers.length > 0 ? ['', ...trailers] : [])].join('\n');
	writeFileSync(MESSAGE_FILE, `${final}\n`);
	process.stderr.write(`commit-msg : ${final.split('\n')[0]}\n`);
}

try {
	main();
} catch (error) {
	process.stderr.write(`commit-msg : erreur ignorée (${error instanceof Error ? error.message : String(error)})\n`);
}
