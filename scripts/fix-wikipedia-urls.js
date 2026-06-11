const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/figures.json'), 'utf8'));

// Map from Spanish URL path → English Wikipedia article title
const pathFix = {
  'Ramsés_II': 'Ramesses_II',
  'Sócrates': 'Socrates',
  'Platón': 'Plato',
  'Aristóteles': 'Aristotle',
  'Arquímedes': 'Archimedes',
  'Aníbal_Barca': 'Hannibal',
  'Marco_Tulio_Cicerón': 'Cicero',
  'Julio_César': 'Julius_Caesar',
  'Tomás_de_Aquino': 'Thomas_Aquinas',
  'Cristóbal_Colón': 'Christopher_Columbus',
  'Nicolás_Maquiavelo': 'Niccolò_Machiavelli',
  'Nicolás_Copérnico': 'Nicolaus_Copernicus',
  'Miguel_Ángel': 'Michelangelo',
  'Martín_Lutero': 'Martin_Luther',
  'Napoleón_Bonaparte': 'Napoleon',
  'León_Tolstói': 'Leo_Tolstoy',
  'Fiódor_Dostoievski': 'Fyodor_Dostoevsky',
  'Víctor_Hugo': 'Victor_Hugo',
  'Pitágoras': 'Pythagoras',
  'Heródoto': 'Herodotus',
  'Hipócrates': 'Hippocrates',
  'Tucídides': 'Thucydides',
  'Diógenes_de_Sinope': 'Diogenes',
  'Jesús_de_Nazaret': 'Jesus',
  'Lorenzo_de_Médici': "Lorenzo_de'_Medici",
  'Américo_Vespucio': 'Amerigo_Vespucci',
  'Dmitri_Mendeléyev': 'Dmitri_Mendeleev',
  'María_Antonieta': 'Marie_Antoinette',
  'Marqués_de_La_Fayette': 'Gilbert_du_Motier,_Marquis_de_Lafayette',
  'Escipión_el_Africano': 'Scipio_Africanus',
  'Catón_el_Viejo': 'Cato_the_Elder',
  'Séneca': 'Seneca_the_Younger',
  'Calígula': 'Caligula',
  'Tácito': 'Tacitus',
  'Francisco_de_Asís': 'Francis_of_Assisi',
  'Tomás_Moro': 'Thomas_More',
  'Antón_Chéjov': 'Anton_Chekhov',
  'Ígor_Stravinski': 'Igor_Stravinsky',
  'León_Trotski': 'Leon_Trotsky',
  'Gueorgui_Zhúkov': 'Georgy_Zhukov',
  'Leonid_Brézhnev': 'Leonid_Brezhnev',
  'Mijaíl_Gorbachov': 'Mikhail_Gorbachev',
  'Volodímir_Zelenski': 'Volodymyr_Zelenskyy',
  'David_Ben-Gurión': 'David_Ben-Gurion',
  'Benjamín_Netanyahu': 'Benjamin_Netanyahu',
  'Andréi_Sájarov': 'Andrei_Sakharov',
  'Serguéi_Rajmáninov': 'Sergei_Rachmaninoff',
  'Dmitri_Shostakóvich': 'Dmitri_Shostakovich',
  'Sargón_de_Acad': 'Sargon_of_Akkad',
  'Tutankamón': 'Tutankhamun',
  'Solón': 'Solon',
  'Heráclito': 'Heraclitus',
  'Sófocles': 'Sophocles',
  'Eurípides': 'Euripides',
  'Aristófanes': 'Aristophanes',
  'Demócrito': 'Democritus',
  'Diógenes_Laercio': 'Diogenes_Laërtius',
  'Antonino_Pío': 'Antoninus_Pius',
  'Cómodo': 'Commodus_(emperor)',
  'Pedro_el_Ermitaño': 'Peter_the_Hermit',
  'Augusto': 'Augustus',
  'Borís_Pasternak': 'Boris_Pasternak',
  'Vladímir_Nabokov': 'Vladimir_Nabokov',
  'Margaret_Hamilton_(científica)': 'Margaret_Hamilton_(software_engineer)',
  'Prince_(músico)': 'Prince_(musician)',
  'Erasmo_de_Róterdam': 'Desiderius_Erasmus',
  'Mustafá_Kemal_Atatürk': 'Mustafa_Kemal_Atatürk',
  'Hồ_Chí_Minh': 'Ho_Chi_Minh',
  'Luiz_Inácio_Lula_da_Silva': 'Luiz_Inácio_Lula_da_Silva',
  'Álvar_Núñez_Cabeza_de_Vaca': 'Álvar_Núñez_Cabeza_de_Vaca',
  'Julio_Cortázar': 'Julio_Cortázar',
  'Borís_Pasternak': 'Boris_Pasternak',
  'Serguéi_Rajmáninov': 'Sergei_Rachmaninoff',
};

let fixed = 0;
const result = data.map(f => {
  if (!f.wikipedia || !f.wikipedia.includes('en.wikipedia.org')) return f;
  const url = new URL(f.wikipedia);
  const pathPart = decodeURIComponent(url.pathname.replace('/wiki/', ''));
  if (pathFix[pathPart]) {
    fixed++;
    return { ...f, wikipedia: `https://en.wikipedia.org/wiki/${pathFix[pathPart]}` };
  }
  return f;
});

fs.writeFileSync(path.join(__dirname, '../data/figures.json'), JSON.stringify(result, null, 2));
console.log(`Corregidas ${fixed} URLs de Wikipedia`);

// Show remaining non-ASCII
const remaining = result.filter(f => f.wikipedia && /[^\x00-\x7F]/.test(f.wikipedia) && f.wikipedia.includes('en.wikipedia.org'));
if (remaining.length > 0) {
  console.log('\nQuedan con caracteres no ASCII:');
  remaining.forEach(f => console.log(`  id=${f.id} ${f.name}: ${f.wikipedia}`));
}
