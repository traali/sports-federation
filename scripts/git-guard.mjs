#!/usr/bin/env node
/**
 * 🛡️ GIT GUARD: Zero-Dependency Pre-Commit & Commit-Msg Enforcer
 * Handles: Anti-slop template token leaks, secret detection, and Conventional Commits.
 */
import { readFileSync, existsSync, statSync } from 'node:fs';

const mode = process.argv[2];
const files = process.argv.slice(3);

// 1. COMMIT-MSG VALIDATION
if (mode === 'commit-msg') {
  const msgFile = files[0];
  if (!msgFile || !existsSync(msgFile)) process.exit(0);
  const firstLine = readFileSync(msgFile, 'utf8').trim().split('\n')[0];

  // Conventional Commits regex: type(optional scope): description
  const conventionalRegex = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-zA-Z0-9_\-.]+\))?!?: .{1,100}$/;
  if (!conventionalRegex.test(firstLine)) {
    console.error('\n❌ [GIT GUARD] Invalid commit message format!');
    console.error(`   Received: "${firstLine}"`);
    console.error('   Required Conventional Commit: <type>(<scope>): <description>');
    console.error('   Allowed types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert');
    console.error('   Example: feat(federation): implement monastic invariant test suites\n');
    process.exit(1);
  }
  process.exit(0);
}

// 2. ANTI-SLOP TOKEN LEAK INSPECTION
if (mode === 'tokens') {
  // ── Code files (.ts, .tsx, .js, .jsx, .mjs, .cjs) ──
  // Checks bracketed template placeholders: [object Object], [SYÖTÄ TULOS], [PVM]
  // Checks string concatenations: e.g. "str" + undefined, null + "str", NaN + "str"
  // Checks template interpolations of literal primitives: ${undefined}, ${null}, ${NaN}
  // Checks raw JSX text leaks: >undefined<, >null<, >NaN<
  // Standard language keywords (useRef(null), typeof x !== 'undefined', TS types) are ALLOWED.
  const codeLeakRegex = /(?:\[object Object\]|\[SYÖTÄ TULOS\]|\[PVM\]|(?:\b(?:undefined|null|NaN)\b\s*\+)|(?:\+\s*\b(?:undefined|null|NaN)\b)|\$\{\s*(?:undefined|null|NaN)\s*\}|>\s*(?:undefined|null|NaN)\s*<)/;

  // ── Non-code / markup / output files (.md, .json, .html, .txt) ──
  // Checks all placeholders: raw undefined, null, NaN, [object Object], [PVM], [SYÖTÄ TULOS]
  // Word boundaries (\bnull\b) guarantee Finnish "annulloitu" and Swedish "annullerad" are NEVER flagged.
  const nonCodeLeakRegex = /(?:\b(?:undefined|null|NaN)\b|\[object Object\]|\[SYÖTÄ TULOS\]|\[PVM\])/;

  let hasLeak = false;

  for (const file of files) {
    if (!existsSync(file)) continue;
    try {
      if (statSync(file).isDirectory()) continue;
    } catch {
      continue;
    }

    // Skip build outputs, node_modules, git directories
    if (file.includes('node_modules') || file.includes('.git') || file.includes('dist') || file.includes('.system_generated')) continue;
    // Skip binary, lock, and wasm files
    if (file.endsWith('.lock') || file.endsWith('-lock.json') || file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.parquet') || file.endsWith('.wasm') || file.endsWith('.wasm.js') || file.endsWith('.traineddata')) continue;
    // Skip test files, fixtures, git-guard itself, token safety assertions, and intentional template generator models
    if (file.includes('test') || file.includes('fixtures') || file.includes('git-guard') || file.includes('verify-token-safety') || file.includes('deterministicReasoner')) continue;

    const isCode = /\.(ts|tsx|js|jsx|mjs|cjs)$/i.test(file);
    const isMarkdown = /\.md$/i.test(file);
    const content = readFileSync(file, 'utf8');
    const lines = content.split('\n');

    let inMarkdownCodeBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Skip lines with explicit git-guard ignore comments
      if (trimmed.includes('git-guard-ignore') || trimmed.includes('token-ignore')) continue;

      // In code files: skip single-line and JSDoc comments
      if (isCode && (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*'))) continue;

      // In markdown files: skip fenced code blocks
      if (isMarkdown) {
        if (trimmed.startsWith('```')) {
          inMarkdownCodeBlock = !inMarkdownCodeBlock;
          continue;
        }
        if (inMarkdownCodeBlock) continue;
      }

      // In markdown: strip inline code backticks (`...`) and LaTeX math ($$...$$) so documented keywords do not trigger false leaks
      let lineToCheck = line;
      if (isMarkdown) {
        lineToCheck = line.replace(/`[^`]*`/g, '').replace(/\$\$?[^\$]*\$\$?/g, '');
      }

      // Documentation files in docs/ are architectural specs; scan for true placeholders and unrendered tokens, not explanatory prose words
      const isDocs = file.startsWith('docs') || file.includes('/docs/') || file.includes('\\docs\\');
      const docsLeakRegex = /(?:\[object Object\]|\[SYÖTÄ TULOS\]|\[PVM\]|\$\{\s*(?:undefined|null|NaN)\s*\})/;
      const regex = isCode ? codeLeakRegex : (isDocs ? docsLeakRegex : nonCodeLeakRegex);

      if (regex.test(lineToCheck)) {
        console.error(`❌ [GIT GUARD] Template token leak in ${file}:${i + 1}`);
        console.error(`   Line: ${line.trim()}`);
        hasLeak = true;
      }
    }
  }

  if (hasLeak) {
    console.error('\n🚫 [GIT GUARD] Commit aborted: Unrendered template placeholders detected!\n');
    process.exit(1);
  }
  process.exit(0);
}

// 3. SECRET LEAK INSPECTION
if (mode === 'secrets') {
  const secretPatterns = [
    { name: 'Private Key Block', regex: /-----BEGIN (?:RSA|EC|OPENSSH|PGP|DSA)? PRIVATE KEY-----/ },
    { name: 'Cloudflare Bearer Token', regex: /Bearer\s+[A-Za-z0-9_-]{40}/ },
    { name: 'AWS Access Key ID', regex: /AKIA[0-9A-Z]{16}/ },
    { name: 'Generic Hardcoded Secret', regex: /(?:api_key|apikey|app_secret|client_secret)\s*[:=]\s*['"][A-Za-z0-9_\-]{20,}['"]/i },
  ];

  let hasSecret = false;
  for (const file of files) {
    if (!existsSync(file)) continue;
    try {
      if (statSync(file).isDirectory()) continue;
    } catch {
      continue;
    }

    // Skip system/build outputs and vendor directories
    if (file.includes('node_modules') || file.includes('.git') || file.includes('dist') || file.includes('.system_generated') || file.includes('.wrangler')) continue;
    // Skip binary, lock, and compiled wasm artifacts
    if (file.endsWith('.lock') || file.endsWith('-lock.json') || file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.parquet') || file.endsWith('.wasm') || file.endsWith('.wasm.js') || file.endsWith('.traineddata')) continue;
    // Skip git guard script itself
    if (file.includes('git-guard')) continue;

    // Check if file resides in an explicit test fixture or mock directory
    const isFixture = /(?:^|[\\/])(?:tests?[\\/](?:fixtures|mocks)|__fixtures__|__mocks__|test-fixtures|fixtures)(?:[\\/]|$)/i.test(file);

    // Check credentials files (.env variants, private keys, certs)
    // Matches: .env, .env.production, .env.staging, .env.local, test_secret.env, etc.
    // Excludes safe template/example files (.env.example, .env.sample, .env.template)
    const isEnv = /(?:^|[\\/])(?:\.env(?:\..+)?|[^\\/]+\.env)$/i.test(file) && !/\.(?:example|sample|template)$/i.test(file);
    const isKey = /(?:^|[\\/])(?:.+\.(?:pem|key|p12|pfx|pkcs12)|id_rsa(?:[^\\/]+)?|id_ed25519(?:[^\\/]+)?|id_dsa(?:[^\\/]+)?)$/i.test(file);

    if (!isFixture && (isEnv || isKey)) {
      console.error(`❌ [GIT GUARD] Forbidden credentials file staged: ${file}`);
      hasSecret = true;
      continue;
    }

    // Skip content inspection for intentional mock files in designated fixture directories
    if (isFixture) continue;

    const content = readFileSync(file, 'utf8');
    for (const pattern of secretPatterns) {
      if (pattern.regex.test(content)) {
        console.error(`❌ [GIT GUARD] Potential secret leak detected (${pattern.name}) in ${file}`);
        hasSecret = true;
      }
    }
  }

  if (hasSecret) {
    console.error('\n🚫 [GIT GUARD] Commit aborted: Secrets or credentials files detected!\n');
    process.exit(1);
  }
  process.exit(0);
}

console.log(`🛡️ [GIT GUARD] Usage: node git-guard.mjs <tokens|secrets|commit-msg> [args...]`);
process.exit(0);
