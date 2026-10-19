#!/usr/bin/env node
/**
 * Garde-fou des agents Sport Up, branché sur les hooks de Claude Code (`.claude/settings.json`)
 * et d'Antigravity (`.agents/hooks.json`).
 *
 * Source : sportup-core/.agents/shared/scripts/guard.mjs, distribuée par `npm run agents:sync`.
 * Ne jamais modifier une copie : modifier la source puis relancer la synchronisation.
 *
 * Usage : node guard.mjs <pre|post|stop> [--agy]
 *   pre  : refuse ou soumet à l'utilisateur les actions sensibles (secrets, production, git, publication…)
 *   post : mémorise les fichiers modifiés pendant la session
 *   stop : avant de rendre la main, vérifie les types et ESLint (s'il est configuré) des fichiers modifiés
 *
 * Toute erreur interne laisse passer l'action : le garde-fou ne doit jamais bloquer l'agent par accident.
 */
import {spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {basename, dirname, isAbsolute, join, resolve} from 'node:path';

const [event, flag] = process.argv.slice(2);
const IS_ANTIGRAVITY = flag === '--agy';
const GENERATED_MARKER = 'GÉNÉRÉ par sportup-core/scripts/sync-agents.mjs';
const MAX_STOP_RETRIES = 2;
const MAX_REASON_LENGTH = 6000;
const CHECK_TIMEOUT_MS = 240_000;
const STATE_DIR = join(tmpdir(), 'sportup-guard');

/** Fichiers que les agents ne lisent ni n'écrivent : secrets, certificats, données. */
const SECRET_PATHS = [
	/(^|\/)\.env(\.(?!example$)[^/]+)?$/,
	/(^|\/)\.?credentials(\.json)?(\/|$)/,
	/(^|\/)(googleservice-info\.plist|google-services\.json|\.npmrc)$/,
	/\.(pem|p8|p12|pfx|jks|keystore)$/,
	/(^|\/)(certs|\.db_data|\.appsmith_stacks|\.ssh|\.sportup)(\/|$)/,
	/(^|\/)id_(rsa|ecdsa|ed25519)/,
];

/** Fichiers générés ou installés : on modifie leur source, jamais eux. */
const GENERATED_PATHS = [
	/(^|\/)generated\//,
	/(^|\/)(dist|node_modules|coverage|\.next|\.expo|\.nyc_output)\//,
	/(^|\/)\.claude\/(rules|skills)\//,
	/(^|\/)\.claude\/settings\.json$/,
	/(^|\/)\.agents\/(hooks\.json$|mcp_config\.json$|scripts\/)/,
	/(^|\/)\.mcp\.json$/,
	/(^|\/)(package-lock\.json|yarn\.lock)$/,
];
const SHARED_SOURCE = /(^|\/)sportup-core\/\.agents\/shared\//;

/** Valeurs de secrets reconnaissables, interdites en dur dans le code. */
const SECRET_VALUES = [
	/\b[rs]k_(live|test)_[0-9a-zA-Z]{16,}/,
	/\bwhsec_[0-9a-zA-Z]{16,}/,
	/-----BEGIN [A-Z ]*PRIVATE KEY-----/,
	/\bglpat-[0-9a-zA-Z_-]{20,}/,
	/\bgh[pousr]_[0-9a-zA-Z]{36,}/,
	/\bAKIA[0-9A-Z]{16}\b/,
	/\bxox[abprs]-[0-9a-zA-Z-]{10,}/,
];

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1', 'host.docker.internal']);
const SAFE_DELETE_TARGETS = new Set(['node_modules', 'dist', 'build', 'coverage', '.next', '.expo', '.nyc_output', '.turbo', 'tmp', 'scratch']);
/** Client de base lancé comme programme (en tête de sous-commande), pas un simple chemin `hasura/…`. */
const DATABASE_TOOLS = /(^|[;&|(]\s*)(npx\s+)?(hasura|psql|pg_dump|pg_restore|pgcli)(\.exe)?\s/im;
const NETWORK_TOOLS = /\b(curl|wget|iwr|irm|invoke-webrequest|invoke-restmethod|http|xh|nc|ncat|telnet)\b/i;
const PIPE_TO_SHELL = [/\|\s*(sh|bash|zsh|pwsh|powershell|iex)\b/i, /\binvoke-expression\b/i, /\biex\s*\(/i];
const CHECKED_FILE = /\.(ts|tsx|mts|cts|js|jsx|mjs|cjs)$/i;
const TYPESCRIPT_FILE = /\.(ts|tsx|mts|cts)$/i;
const ESLINT_CONFIGS = ['eslint.config.js', 'eslint.config.mjs', 'eslint.config.cjs', 'eslint.config.ts', 'eslint.config.mts'];

const ASK_USER = "Demander l'accord explicite de l'utilisateur.";

/**
 * Règles appliquées à chaque sous-commande, dans l'ordre : la première qui correspond décide.
 * `any` : une des regex correspond. `all` : toutes correspondent.
 */
const COMMAND_RULES = [
	{decision: 'deny', reason: 'Contourner les hooks git est interdit.', any: [/--no-verify\b/i]},
	{decision: 'deny', reason: 'Le push forcé est interdit.', all: [/\bgit\s+push\b/i, /\s(-f|--force)(\s|$)/i]},
	{decision: 'deny', reason: 'Le profil production est interdit en local.', any: [/use-env\.mjs\s+prod/i, /\benv:prod/i]},
	{decision: 'deny', reason: "Afficher les variables d'environnement exposerait des secrets.", any: [/^\s*(printenv|env|set)\s*$/i, /\b(get-childitem|gci|ls|dir)\s+env:/i]},
	{decision: 'ask', reason: `Cette commande Docker affiche les variables d'environnement, donc des secrets. ${ASK_USER}`, all: [/\bdocker\b/i, /\s(config|inspect)\b/i]},
	{decision: 'ask', reason: `Cette commande affiche les variables d'environnement d'un conteneur. ${ASK_USER}`, all: [/\bdocker\s+exec\b/i, /\b(env|printenv)\b/i]},
	{decision: 'ask', reason: `Commit, push et historique git : uniquement à la demande de l'utilisateur. ${ASK_USER}`, any: [/\bgit\s+(commit|push|merge|rebase|tag|cherry-pick|revert|am)\b/i]},
	{
		decision: 'ask',
		reason: `Commande git destructive pour le travail en cours. ${ASK_USER}`,
		any: [/\bgit\s+reset\s+--hard\b/i, /\bgit\s+clean\s+-\w*f/i, /\bgit\s+(restore|filter-branch|filter-repo|update-ref)\b/i, /\bgit\s+checkout\s+(--|\.)(\s|$)/i, /\bgit\s+branch\s+-\w*d/i, /\bgit\s+stash\s+(drop|clear)\b/i],
	},
	{decision: 'ask', reason: `Modification de la configuration git globale. ${ASK_USER}`, any: [/\bgit\s+config\s+--(global|system)\b/i]},
	{decision: 'ask', reason: `Publication ou montée de version. ${ASK_USER}`, any: [/\b(npm|pnpm|yarn)\s+(publish|unpublish|deprecate|dist-tag|version)\b/i, /\brelease-it\b/i, /\bnpm\s+run\s+release\b/i]},
	{decision: 'ask', reason: `Action Expo EAS dans le cloud. ${ASK_USER}`, any: [/\beas\s+(build|submit|update|deploy|secret|env|credentials|metadata)\b/i]},
	{decision: 'ask', reason: `Action Docker destructive ou vers un registre. ${ASK_USER}`, any: [/\bdocker\s+(push|login)\b/i, /\bdocker\s+(volume|system|image|container|network)\s+(rm|prune)\b/i]},
	{decision: 'ask', reason: `Suppression des volumes Docker, donc des données locales. ${ASK_USER}`, all: [/\bdocker\b/i, /\sdown\b/i, /\s(-v|--volumes)\b/i]},
	{
		decision: 'ask',
		reason: `Suppression de données. ${ASK_USER}`,
		any: [/reset:local|reset-hasura/i, /\bmigrate\s+delete\b/i, /\bmetadata\s+clear\b/i, /\bdropdb\b/i, /\bdrop\s+(database|schema|table)\b/i, /\btruncate\s/i],
	},
	{decision: 'ask', reason: `Connexion à une machine distante. ${ASK_USER}`, any: [/^\s*(ssh|scp|sftp|rsync)\s/i]},
	{decision: 'ask', reason: `Action d'écriture sur GitLab ou GitHub. ${ASK_USER}`, all: [/^\s*(glab|gh)\s/i, /\s(create|merge|close|delete|approve|edit|update|set|retry|cancel|run|comment|note)\b/i]},
	{decision: 'ask', reason: `Requête d'écriture sur l'API GitLab ou GitHub. ${ASK_USER}`, all: [/^\s*(glab|gh)\s+api\b/i, /\s(-X|--method)\s*(post|put|patch|delete)\b/i]},
];

const matchesAny = (patterns, value) => patterns.some((pattern) => pattern.test(value));
const matchesRule = (rule, segment) => (!rule.any || matchesAny(rule.any, segment)) && (!rule.all || rule.all.every((pattern) => pattern.test(segment)));
const toSlashes = (path) => path.replaceAll('\\', '/');

/** Normalise un chemin (absolu, relatif, URI `file://`, Windows) en chemin absolu à barres obliques. */
function toPosix(rawPath, cwd) {
	let path = String(rawPath).replace(/^file:\/\//i, '');
	try {
		path = decodeURIComponent(path);
	} catch {
		// chemin déjà décodé
	}
	path = path.replace(/^\/([a-z]:)/i, '$1');
	if (!isAbsolute(path) && !/^[a-z]:/i.test(path)) {
		path = resolve(cwd, path);
	}
	return toSlashes(path);
}

function cwdOf(payload) {
	const cwd = payload.cwd ?? payload.toolCall?.args?.Cwd ?? payload.workspacePaths?.[0] ?? process.cwd();
	return toPosix(cwd, process.cwd());
}

/** Ramène les appels d'outils de Claude Code et d'Antigravity à une forme commune. */
function describeTool(payload) {
	if (IS_ANTIGRAVITY) {
		const name = payload.toolCall?.name;
		const args = payload.toolCall?.args ?? {};
		const kinds = {run_command: 'command', view_file: 'read', grep_search: 'read', write_to_file: 'edit', replace_file_content: 'edit', multi_replace_file_content: 'edit'};
		return {kind: kinds[name], command: args.CommandLine, path: args.TargetFile ?? args.AbsolutePath ?? args.SearchPath, content: JSON.stringify(args)};
	}
	const input = payload.tool_input ?? {};
	const kinds = {Bash: 'command', PowerShell: 'command', Read: 'read', Grep: 'read', Edit: 'edit', Write: 'edit', MultiEdit: 'edit', NotebookEdit: 'edit'};
	const content = [input.content, input.new_string, input.new_source, ...(input.edits ?? []).map((edit) => edit.new_string)].filter(Boolean).join('\n');
	return {kind: kinds[payload.tool_name], command: input.command, path: input.file_path ?? input.notebook_path ?? input.path, content};
}

/** Hôte d'un token : URL (`scheme://user@host:port/…`) ou valeur d'option `-h`/`--host` d'un client de base. */
function hostOf(token, previous, isDatabase) {
	const schemeIndex = token.indexOf('://');
	if (schemeIndex > 0) {
		return token.slice(schemeIndex + 3).split(/[/?#'"]/)[0].split('@').pop();
	}
	if (!isDatabase) {
		return null;
	}
	if (previous === '-h' || previous === '--host') {
		return token;
	}
	if (token.startsWith('--host=')) {
		return token.slice('--host='.length);
	}
	return null;
}

function remoteHosts(command) {
	const isDatabase = DATABASE_TOOLS.test(command);
	const tokens = command.split(/\s+/).map((token) => token.replace(/^['"]/, '').replace(/['"]$/, ''));
	return tokens
		.map((token, index) => hostOf(token, tokens[index - 1], isDatabase))
		.filter(Boolean)
		.map((host) => host.replace(/:\d+$/, '').replace(/^\[/, '').replace(/\]$/, '').toLowerCase())
		.filter((host) => /^[\w.-]+$/.test(host) && !host.startsWith('-') && !LOCAL_HOSTS.has(host));
}

function isRecursiveDelete(program, tokens) {
	if (program === 'rm') {
		return tokens.some((token) => /^-[a-z]*r[a-z]*$/i.test(token) || token === '--recursive');
	}
	return /^(remove-item|ri|del|rd|rmdir)$/.test(program) && tokens.some((token) => /^(-r|-recurse|\/s)$/i.test(token));
}

/** Suppressions récursives et changements de dépendances, analysés sur les tokens d'une sous-commande. */
function checkSegment(segment) {
	const tokens = segment.trim().split(/\s+/).map((token) => token.replace(/^['"]/, '').replace(/['"]$/, ''));
	const [program = '', subcommand = ''] = tokens.map((token) => token.toLowerCase());
	if (isRecursiveDelete(program, tokens)) {
		const targets = tokens.slice(1).filter((token) => !token.startsWith('-') && !/^\/[sq]$/i.test(token));
		const unsafe = targets.filter((target) => !SAFE_DELETE_TARGETS.has(basename(target.replace(/[\\/]+$/, '')).toLowerCase()));
		return unsafe.length > 0 ? {decision: 'ask', reason: `Suppression récursive de ${unsafe.join(', ')}. ${ASK_USER}`} : null;
	}
	if (!/^(npm|pnpm|yarn|bun|pip|pip3)$/.test(program)) {
		return null;
	}
	const packages = tokens.slice(2).filter((token) => !token.startsWith('-'));
	const isRemoval = /^(uninstall|remove|rm|un|r)$/.test(subcommand);
	const isAddition = /^(install|i|add)$/.test(subcommand) && packages.length > 0;
	if (isRemoval || isAddition) {
		return {decision: 'ask', reason: `Ajout ou retrait de dépendance (${packages.join(', ') || subcommand}) : vérifier la licence et la provenance. ${ASK_USER}`};
	}
	return null;
}

function findSecretToken(command) {
	return command
		.split(/[\s"'`=<>|;&(),]+/)
		.filter((token) => /[./]/.test(token) && !token.includes('://'))
		.map((token) => toSlashes(token).toLowerCase())
		.find((token) => matchesAny(SECRET_PATHS, token));
}

function checkCommand(command) {
	const secretToken = findSecretToken(command);
	if (secretToken) {
		return {decision: 'deny', reason: `Accès à un fichier sensible (${secretToken}) interdit aux agents : secrets, certificats ou données. Utiliser .env.example ou demander à l'utilisateur.`};
	}
	if (matchesAny(PIPE_TO_SHELL, command)) {
		return {decision: 'deny', reason: 'Exécuter un script téléchargé ou une chaîne dynamique est interdit.'};
	}
	const hosts = remoteHosts(command);
	if (hosts.length > 0 && (DATABASE_TOOLS.test(command) || /admin-secret/i.test(command))) {
		return {decision: 'deny', reason: `Accès à une base ou à un Hasura distant (${hosts.join(', ')}) interdit : localhost uniquement.`};
	}
	const segments = command.split(/&&|\|\||[;\n|]/);
	for (const rule of COMMAND_RULES) {
		if (segments.some((segment) => matchesRule(rule, segment))) {
			return {decision: rule.decision, reason: rule.reason};
		}
	}
	const segmentResult = segments.map(checkSegment).find(Boolean);
	if (segmentResult) {
		return segmentResult;
	}
	if (hosts.length > 0 && NETWORK_TOOLS.test(command)) {
		return {decision: 'ask', reason: `Requête réseau vers ${hosts.join(', ')} : vérifier qu'aucune donnée Sport Up ne sort. ${ASK_USER}`};
	}
	return null;
}

function isGeneratedCopy(path) {
	return path.endsWith('.md') && existsSync(path) && readFileSync(path, 'utf-8').includes(GENERATED_MARKER);
}

function checkPath({kind, path: rawPath, content}, cwd) {
	const path = toPosix(rawPath, cwd);
	const lower = path.toLowerCase();
	// `.key` n'est contrôlé que sur les chemins de fichiers : dans une commande, c'est souvent du code (`item.key`).
	if (matchesAny(SECRET_PATHS, lower) || lower.endsWith('.key')) {
		return {decision: 'deny', reason: `Fichier sensible (${basename(path)}) : accès interdit aux agents. Utiliser .env.example ou demander à l'utilisateur.`};
	}
	if (kind !== 'edit') {
		return null;
	}
	if ((matchesAny(GENERATED_PATHS, lower) && !SHARED_SOURCE.test(lower)) || isGeneratedCopy(path)) {
		return {decision: 'deny', reason: 'Fichier généré : modifier sa source (Hasura puis `npm run sync:local` pour les types, `sportup-core/.agents/shared/` puis `npm run agents:sync` pour les instructions agents), jamais la copie.'};
	}
	if (content && matchesAny(SECRET_VALUES, content)) {
		return {decision: 'deny', reason: "Secret en dur détecté dans le contenu : le lire depuis une variable d'environnement et documenter la clé dans .env.example."};
	}
	return null;
}

function checkTool(payload) {
	const tool = describeTool(payload);
	if (tool.kind === 'command') {
		return tool.command ? checkCommand(String(tool.command)) : null;
	}
	return tool.kind && tool.path ? checkPath(tool, cwdOf(payload)) : null;
}

function statePath(payload) {
	const id = String(payload.session_id ?? payload.conversationId ?? 'default').replaceAll(/[^\w-]/g, '_');
	return join(STATE_DIR, `${id}.json`);
}

function readState(file) {
	try {
		return JSON.parse(readFileSync(file, 'utf-8'));
	} catch {
		return {files: [], retries: 0};
	}
}

function writeState(file, state) {
	mkdirSync(STATE_DIR, {recursive: true});
	writeFileSync(file, JSON.stringify(state));
}

function recordEdit(payload) {
	const {kind, path} = describeTool(payload);
	if (kind !== 'edit' || !path || !CHECKED_FILE.test(path)) {
		return;
	}
	const file = statePath(payload);
	const state = readState(file);
	const absolute = toPosix(path, cwdOf(payload));
	if (!state.files.includes(absolute)) {
		state.files.push(absolute);
	}
	writeState(file, state);
}

function findRepoRoot(path) {
	let dir = dirname(path);
	while (!existsSync(join(dir, '.git'))) {
		const parent = dirname(dir);
		if (parent === dir) {
			return null;
		}
		dir = parent;
	}
	return toSlashes(dir);
}

function groupByRepo(files) {
	const groups = new Map();
	for (const file of files) {
		const repo = findRepoRoot(file);
		if (repo) {
			groups.set(repo, [...(groups.get(repo) ?? []), file]);
		}
	}
	return groups;
}

function run(repo, script, args) {
	return spawnSync(process.execPath, [script, ...args], {cwd: repo, encoding: 'utf-8', timeout: CHECK_TIMEOUT_MS, maxBuffer: 64 * 1024 * 1024});
}

/** Erreurs TypeScript des seuls fichiers modifiés : les erreurs déjà présentes ailleurs ne bloquent pas l'agent. */
function typecheck(repo, files) {
	const tsc = join(repo, 'node_modules', 'typescript', 'bin', 'tsc');
	if (!files.some((file) => TYPESCRIPT_FILE.test(file)) || !existsSync(join(repo, 'tsconfig.json')) || !existsSync(tsc)) {
		return [];
	}
	const touched = new Set(files.map((file) => file.toLowerCase()));
	const errors = (run(repo, tsc, ['--noEmit', '-p', '.']).stdout ?? '').split(/\r?\n/).filter((line) => {
		const match = /^(.+?)\(\d+,\d+\): error TS\d+/.exec(line);
		return match && touched.has(toPosix(match[1], repo).toLowerCase());
	});
	return errors.length > 0 ? [`TypeScript (${basename(repo)}) :\n${errors.join('\n')}`] : [];
}

/** ESLint sur les fichiers modifiés, seulement dans les repos qui ont une config plate non vide. */
function lint(repo, files) {
	const eslintDir = join(repo, 'node_modules', 'eslint');
	const hasConfig = ESLINT_CONFIGS.some((name) => existsSync(join(repo, name)) && statSync(join(repo, name)).size > 0);
	if (!hasConfig || !existsSync(join(eslintDir, 'package.json'))) {
		return [];
	}
	const major = Number(JSON.parse(readFileSync(join(eslintDir, 'package.json'), 'utf-8')).version.split('.')[0]);
	if (major < 9) {
		return [];
	}
	const result = run(repo, join(eslintDir, 'bin', 'eslint.js'), ['--quiet', '--no-warn-ignored', ...files]);
	return result.status === 1 ? [`ESLint (${basename(repo)}) :\n${result.stdout.trim()}`] : [];
}

function verify(payload) {
	const file = statePath(payload);
	const state = readState(file);
	const files = state.files.filter((path) => existsSync(path));
	const problems = [...groupByRepo(files)].flatMap(([repo, repoFiles]) => [...typecheck(repo, repoFiles), ...lint(repo, repoFiles)]);
	if (problems.length === 0) {
		rmSync(file, {force: true});
		return null;
	}
	state.retries = (state.retries ?? 0) + 1;
	if (state.retries > MAX_STOP_RETRIES) {
		rmSync(file, {force: true});
		process.stderr.write(`guard : erreurs restantes après ${MAX_STOP_RETRIES} tentatives, à signaler à l'utilisateur.\n`);
		return null;
	}
	writeState(file, state);
	const reason = `Vérification avant de rendre la main (tentative ${state.retries}/${MAX_STOP_RETRIES}) : corriger ces erreurs dans les fichiers modifiés, sans désactiver de règle.\n\n${problems.join('\n\n')}`;
	return reason.slice(0, MAX_REASON_LENGTH);
}

function handlePre(payload) {
	const result = checkTool(payload);
	if (!result) {
		return null;
	}
	if (IS_ANTIGRAVITY) {
		return {decision: result.decision === 'ask' ? 'force_ask' : result.decision, reason: result.reason};
	}
	return {hookSpecificOutput: {hookEventName: 'PreToolUse', permissionDecision: result.decision, permissionDecisionReason: result.reason}};
}

function handlePost(payload) {
	recordEdit(payload);
	return null;
}

function handleStop(payload) {
	const reason = verify(payload);
	if (!reason) {
		return null;
	}
	return {decision: IS_ANTIGRAVITY ? 'continue' : 'block', reason};
}

const HANDLERS = {pre: handlePre, post: handlePost, stop: handleStop};

function respond(output) {
	if (output) {
		process.stdout.write(JSON.stringify(output));
	} else if (IS_ANTIGRAVITY) {
		process.stdout.write('{}');
	}
}

try {
	const input = readFileSync(0, 'utf-8');
	const payload = input.trim() ? JSON.parse(input) : {};
	respond(HANDLERS[event]?.(payload) ?? null);
} catch (error) {
	process.stderr.write(`guard : erreur interne ignorée (${error instanceof Error ? error.message : String(error)})\n`);
	respond(null);
}
