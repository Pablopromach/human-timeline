const fs = require('fs');
const path = require('path');
let d = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/figures.json'), 'utf8'));

const nameToEs = {
  // Egipto / Oriente Próximo
  'Ramesses II':'Ramsés II','Tutankhamun':'Tutankamón','Akhenaten':'Akenatón',
  'Sargon of Akkad':'Sargón de Acad','Darius I':'Darío I','Darius III':'Darío III',
  // Griegos
  'Socrates':'Sócrates','Plato':'Platón','Aristotle':'Aristóteles','Archimedes':'Arquímedes',
  'Pythagoras':'Pitágoras','Herodotus':'Heródoto','Hippocrates':'Hipócrates',
  'Thucydides':'Tucídides','Diogenes of Sinope':'Diógenes de Sínope','Solon':'Solón',
  'Heraclitus':'Heráclito','Sophocles':'Sófocles','Euripides':'Eurípides',
  'Aristophanes':'Aristófanes','Democritus':'Demócrito','Diogenes Laërtius':'Diógenes Laercio',
  'Hesiod':'Hesíodo','Leonidas I':'Leónidas I','Themistocles':'Temístocles',
  'Miltiades':'Milcíades','Alcibiades':'Alcibíades','Anaxagoras':'Anaxágoras',
  'Empedocles':'Empédocles','Parmenides':'Parménides','Zeno of Elea':'Zenón de Elea',
  'Protagoras':'Protágoras','Praxiteles':'Praxíteles','Pindar':'Píndaro',
  'Zeno of Citium':'Zenón de Citio','Eratosthenes':'Eratóstenes','Strabo':'Estrabón',
  'Ptolemy I Soter':'Ptolomeo I Sóter','Seleucus I Nicator':'Seleuco I Nicátor',
  'Antigonus I Monophthalmus':'Antígono I Monóftalmos',
  // Romanos / Cartagineses
  'Hannibal Barca':'Aníbal Barca','Cicero':'Cicerón','Julius Caesar':'Julio César',
  'Augustus':'Augusto','Scipio Africanus':'Escipión el Africano',
  'Cato the Elder':'Catón el Viejo','Quintus Fabius Maximus':'Quinto Fabio Máximo',
  'Cato the Younger':'Catón el Joven','Seneca':'Séneca','Caligula':'Calígula',
  'Tacitus':'Tácito','Antoninus Pius':'Antonino Pío','Commodus':'Cómodo',
  'Stilicho':'Estilicón','Galen of Pergamon':'Galeno de Pérgamo',
  'Hypatia of Alexandria':'Hipatia de Alejandría',
  'Trajan':'Trajano','Hadrian':'Adriano','Julian the Apostate':'Juliano el Apóstata',
  'Nero':'Nerón','Vespasian':'Vespasiano','Septimius Severus':'Septimio Severo',
  'Nerva':'Nerva','Basil II':'Basilio II','Romulus Augustulus':'Rómulo Augústulo',
  'Valerian':'Valeriano','Constantine XI Palaiologos':'Constantino XI Paleólogo',
  'Theodosius II':'Teodosio II','Michael VIII Palaiologos':'Miguel VIII Paleólogo',
  // Patrística / Iglesia
  'Augustine of Hippo':'Agustín de Hipona','Saint Jerome':'San Jerónimo',
  'Saint Ambrose':'San Ambrosio','Origen of Alexandria':'Orígenes de Alejandría',
  'Thomas Aquinas':'Tomás de Aquino','Saint Francis of Assisi':'San Francisco de Asís',
  'Peter the Hermit':'Pedro el Ermitaño',
  // Islam / Oriente
  'Suleiman the Magnificent':'Solimán el Magnífico','Ali ibn Abi Talib':'Alí ibn Abi Tálib',
  'Harun al-Rashid':'Harún al-Rashid','Alhazen':'Alhacén','Maimonides':'Maimónides',
  'Ibn Khaldun':'Ibn Jaldún','Timur (Tamerlane)':'Tamerlán',
  'Akbar the Great':'Akbar el Grande',
  'Yongle Emperor':'Emperador Yongle','Kangxi Emperor':'Emperador Kangxi',
  'Qianlong Emperor':'Emperador Qianlong','Prince Shotoku':'Príncipe Shōtoku',
  // Medieval Europa
  'Otto I the Great':'Otón I el Grande','Thomas More':'Tomás Moro',
  'Thomas Cromwell':'Tomás Cromwell','Catherine of Aragon':'Catalina de Aragón',
  'Alfonso VI of León':'Alfonso VI de León',
  'Ferdinand II of Aragon':'Fernando II de Aragón',
  // Renacimiento / Reforma
  'Christopher Columbus':'Cristóbal Colón','Amerigo Vespucci':'Américo Vespucio',
  "Lorenzo de' Medici":'Lorenzo de Médici','Niccolò Machiavelli':'Nicolás Maquiavelo',
  'Michelangelo':'Miguel Ángel','Nicolaus Copernicus':'Nicolás Copérnico',
  'Martin Luther':'Martín Lutero','Fra Angelico':'Fra Angélico',
  'Andreas Vesalius':'Andrés Vesalio',
  // Modernos
  'Napoleon Bonaparte':'Napoleón Bonaparte','Marie Antoinette':'María Antonieta',
  'Marquis de Lafayette':'Marqués de Lafayette','Dmitri Mendeleev':'Dmitri Mendeléyev',
  'Victor Hugo':'Víctor Hugo','Leo Tolstoy':'León Tolstói',
  'Fyodor Dostoevsky':'Fiódor Dostoievski','Dmitri Shostakovich':'Dmitri Shostakóvich',
  'Andrei Sakharov':'Andréi Sájarov','Igor Stravinsky':'Ígor Stravinski',
  'Georgy Zhukov':'Georgy Zhúkov','Leonid Brezhnev':'Leonid Brézhnev',
  'Volodymyr Zelensky':'Volodímir Zelenski','David Ben-Gurion':'David Ben-Gurión',
  'Kaiser Wilhelm II':'Káiser Guillermo II','Anton Chekhov':'Antón Chéjov',
  // Precolombinos
  'Pachacuti':'Pachacútec','Huayna Capac':'Huayna Cápac','Huascar':'Huáscar',
  'Itzcoatl':'Itzcóatl','Nezahualcoyotl':'Nezahualcóyotl','Ahuizotl':'Ahuízotl',
  'Cuitlahuac':'Cuitláhuac','Manco Capac':'Manco Cápac',
  'Tupac Yupanqui':'Túpac Yupanqui','Jesus of Nazareth':'Jesús de Nazaret',
  // Monarcas británicos
  'William the Conqueror':'Guillermo el Conquistador','Henry II of England':'Enrique II de Inglaterra',
  'Richard I the Lionheart':'Ricardo Corazón de León','Edward I of England':'Eduardo I de Inglaterra',
  'Edward III of England':'Eduardo III de Inglaterra','Henry V of England':'Enrique V de Inglaterra',
  'Henry VIII of England':'Enrique VIII de Inglaterra','Mary I of England':'María I de Inglaterra',
  'Elizabeth I of England':'Isabel I de Inglaterra','James I of England':'Jacobo I de Inglaterra',
  'Charles I of England':'Carlos I de Inglaterra','Charles II of England':'Carlos II de Inglaterra',
  'William III of Orange':'Guillermo III de Orange','George III of England':'Jorge III de Gran Bretaña',
  'Queen Victoria':'Reina Victoria',
  // Monarcas franceses
  'Clovis I':'Clodoveo I','Louis IX of France':'Luis IX de Francia',
  'Philip IV of France':'Felipe IV el Hermoso','Francis I of France':'Francisco I de Francia',
  'Henry IV of France':'Enrique IV de Francia','Louis XIII of France':'Luis XIII de Francia',
  'Louis XV of France':'Luis XV de Francia','Louis XVI of France':'Luis XVI',
  // Monarcas españoles
  'Alfonso X of Castile':'Alfonso X el Sabio','Pedro I of Castile':'Pedro I el Cruel',
  'Philip II of Spain':'Felipe II de España','Philip IV of Spain':'Felipe IV de España',
  // Habsburgo / Sacro Imperio
  'Rudolf I of Habsburg':'Rodolfo I de Habsburgo','Maximilian I':'Maximiliano I',
  'Charles V':'Carlos V','Ferdinand I':'Fernando I','Rudolf II':'Rodolfo II',
  'Leopold I':'Leopoldo I','Joseph II':'José II',
  // Gobernantes rusos
  'Ivan III the Great':'Iván III el Grande','Ivan IV the Terrible':'Iván IV el Terrible',
  'Alexis of Russia':'Alejo de Rusia','Elizabeth of Russia':'Isabel de Rusia',
  'Paul I of Russia':'Pablo I de Rusia','Alexander I of Russia':'Alejandro I de Rusia',
  'Nicholas I of Russia':'Nicolás I de Rusia','Alexander II of Russia':'Alejandro II de Rusia',
  'Alexander III of Russia':'Alejandro III de Rusia','Nicholas II of Russia':'Nicolás II de Rusia',
  'Anna of Russia':'Ana de Rusia',
  // Escandinavos
  'Harald Bluetooth':'Harald Diente Azul','Canute the Great':'Canuto el Grande',
  'Eric the Red':'Erik el Rojo','Leif Erikson':'Leif Eriksson',
  'Margaret I of Denmark':'Margarita I de Dinamarca','Gustav Vasa':'Gustavo Vasa',
  'Christina of Sweden':'Cristina de Suecia',
  // Europa del Este
  'Mieszko I of Poland':'Mieszko I de Polonia','Boleslav I the Brave':'Boleslao I el Bravo',
  'Stephen I of Hungary':'Esteban I de Hungría','Matthias Corvinus':'Matías Corvino',
  'John III Sobieski':'Juan III Sobieski','Sigismund II Augustus':'Segismundo II Augusto',
};

let added = 0;
d = d.map(f => {
  const es = nameToEs[f.name];
  if (es && es !== f.name) { added++; return { ...f, nameEs: es }; }
  return f;
});

fs.writeFileSync(path.join(__dirname, '../data/figures.json'), JSON.stringify(d, null, 2));
console.log('nameEs añadido a', added, 'personajes');
console.log('Ejemplo:', d.find(f => f.nameEs === 'Platón'));
