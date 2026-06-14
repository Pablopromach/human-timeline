const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/figures.json'), 'utf8'));

let patched = 0;
for (let chunk = 1; chunk <= 7; chunk++) {
  const patchFile = path.join(__dirname, `desc-patch-${chunk}.json`);
  if (!fs.existsSync(patchFile)) { console.log(`Missing: desc-patch-${chunk}.json`); continue; }
  const patch = JSON.parse(fs.readFileSync(patchFile, 'utf8'));
  for (const [idStr, desc] of Object.entries(patch)) {
    const id = Number(idStr);
    const fig = data.find(f => f.id === id);
    if (fig && desc) { fig.description = desc; patched++; }
  }
}

fs.writeFileSync(path.join(__dirname, '../data/figures.json'), JSON.stringify(data, null, 2));
console.log(`Applied ${patched} description patches.`);
