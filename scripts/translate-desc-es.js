// Traduce descriptions al español usando el endpoint gratuito de Google Translate
// Requiere Node 18+. Sin API key, sin coste.
// Uso: node scripts/translate-desc-es.js

const fs = require('fs');
const path = require('path');

const FIGURES_PATH = path.join(__dirname, '../data/figures.json');
const DELAY_MS = 150; // pausa entre peticiones para no saturar

async function gtranslate(text) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json[0].map(x => x[0]).join('');
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const data = JSON.parse(fs.readFileSync(FIGURES_PATH, 'utf8'));
  const pending = data.filter(f => f.description && !f.descriptionEs);
  console.log(`Total personajes: ${data.length} | Sin traducir: ${pending.length}`);

  let ok = 0, failed = 0;
  for (const fig of pending) {
    try {
      fig.descriptionEs = await gtranslate(fig.description);
      ok++;
      if (ok % 25 === 0) {
        console.log(`  ${ok}/${pending.length} traducidos...`);
        fs.writeFileSync(FIGURES_PATH, JSON.stringify(data, null, 2));
      }
      await sleep(DELAY_MS);
    } catch (e) {
      console.error(`  Error en ${fig.name} (id ${fig.id}): ${e.message}`);
      failed++;
      await sleep(500);
    }
  }

  fs.writeFileSync(FIGURES_PATH, JSON.stringify(data, null, 2));
  console.log(`\nListo. Traducidos: ${ok} | Fallidos: ${failed}`);
}

main().catch(err => { console.error(err); process.exit(1); });
