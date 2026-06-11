const fs = require('fs');
const path = require('path');
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/figures.json'), 'utf8'));

const pathFix = {
  // Greek/Persian figures (IDs 500+)
  'Akenatón': 'Akhenaten',
  'Darío_I': 'Darius_I',
  'Darío_III': 'Darius_III',
  'Hesíodo': 'Hesiod',
  'Leónidas_I': 'Leonidas_I',
  'Temístocles': 'Themistocles',
  'Milcíades_el_Joven': 'Miltiades',
  'Alcibíades': 'Alcibiades',
  'Anaxágoras': 'Anaxagoras',
  'Empédocles': 'Empedocles',
  'Parménides_de_Elea': 'Parmenides',
  'Zenón_de_Elea': 'Zeno_of_Elea',
  'Protágoras': 'Protagoras',
  'Praxíteles': 'Praxiteles',
  'Píndaro': 'Pindar',
  'Ptolomeo_I_Sóter': 'Ptolemy_I_Soter',
  'Seleuco_I_Nicátor': 'Seleucus_I_Nicator',
  'Antígono_I_Monóftalmos': 'Antigonus_I_Monophthalmus',
  'Zenón_de_Citio': 'Zeno_of_Citium',
  'Eratóstenes': 'Eratosthenes',
  'Hipatia_de_Alejandría': 'Hypatia',
  'Estrabón': 'Strabo',
  'Quinto_Fabio_Máximo_Verrugoso': 'Quintus_Fabius_Maximus',
  'Marco_Porcio_Catón': 'Cato_the_Younger',
  'Estilicón': 'Stilicho',
  'Agustín_de_Hipona': 'Augustine_of_Hippo',
  'Jerónimo_de_Estridón': 'Jerome',
  'Ambrosio_de_Milán': 'Ambrose',
  'Orígenes': 'Origen',
  'Constantino_XI_Paleólogo': 'Constantine_XI_Palaiologos',
  'Solimán_el_Magnífico': 'Suleiman_the_Magnificent',
  'Úmar_ibn_al-Jattab': 'Umar',
  'Alí_ibn_Abi_Tálib': 'Ali_ibn_Abi_Talib',
  'Hárun_al-Rashid': 'Harun_al-Rashid',
  'Alhacén': 'Ibn_al-Haytham',
  'Maimónides': 'Maimonides',
  'Ibn_Jaldún': 'Ibn_Khaldun',
  'Otón_I_el_Grande': 'Otto_I,_Holy_Roman_Emperor',
  'Catalina_de_Aragón': 'Catherine_of_Aragon',
  'Tomás_Cromwell': 'Thomas_Cromwell',
  'Alfonso_VI_de_León': 'Alfonso_VI_of_León',
  'Eloísa': 'Héloïse',
  'Fra_Angélico': 'Fra_Angelico',
  'Andrés_Vesalio': 'Andreas_Vesalius',
  'Pachacútec': 'Pachacuti',
  'Túpac_Yupanqui': 'Topa_Inca_Yupanqui',
  'Huayna_Cápac': 'Huayna_Capac',
  'Huáscar': 'Huáscar',
  'Izcóatl': 'Itzcoatl',
  'Nezahualcóyotl_(tlatoani)': 'Nezahualcoyotl',
  'Ahuízotl': 'Ahuitzotl',
  'Cuitláhuac': 'Cuitlahuac',
  'Cuauhtémoc': 'Cuauhtémoc',
  'Manco_Cápac': 'Manco_Capac',
  'María_Montessori': 'Maria_Montessori',
  // correct already but had wrong slug:
  'Shōtoku': 'Prince_Shōtoku',
  'Bolesław_I_the_Brave': 'Bolesław_I_the_Brave',
};

let fixed = 0;
const result = data.map(f => {
  if (!f.wikipedia || !f.wikipedia.includes('en.wikipedia.org')) return f;
  try {
    const url = new URL(f.wikipedia);
    const raw = url.pathname.replace('/wiki/', '');
    const pathPart = decodeURIComponent(raw);
    if (pathFix[pathPart]) {
      fixed++;
      return { ...f, wikipedia: `https://en.wikipedia.org/wiki/${pathFix[pathPart]}` };
    }
  } catch {}
  return f;
});

fs.writeFileSync(path.join(__dirname, '../data/figures.json'), JSON.stringify(result, null, 2));
console.log(`Corregidas ${fixed} URLs adicionales`);
