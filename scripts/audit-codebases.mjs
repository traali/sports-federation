import fs from 'fs';
import path from 'path';

const monasteries = [
  { name: 'pelipaiva', root: 'pelipaiva/src' },
  { name: 'Parkkis', root: 'Parkkis/web/src' },
  { name: 'floorball-stats', root: 'floorball-stats/src' },
  { name: 'basketball-stats', root: 'basketball-stats/src' },
  { name: 'football-stats', root: 'football-stats/src' },
  { name: 'volleyball-stats', root: 'volleyball-stats/src' },
];

function getFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      getFiles(full, files);
    } else if (/\.(tsx?|jsx?)$/.test(item) && !item.endsWith('.d.ts')) {
      const lines = fs.readFileSync(full, 'utf8').split('\n').length;
      files.push({ path: full.replace(/\\/g, '/'), lines });
    }
  }
  return files;
}

for (const m of monasteries) {
  const files = getFiles(m.root);
  files.sort((a, b) => b.lines - a.lines);
  const totalLines = files.reduce((s, f) => s + f.lines, 0);
  console.log(`\n📦 [${m.name.toUpperCase()}] Total: ${totalLines} lines across ${files.length} code files:`);
  for (const f of files.slice(0, 7)) {
    console.log(`   ${f.lines.toString().padStart(5, ' ')} lines : ${f.path}`);
  }
}
