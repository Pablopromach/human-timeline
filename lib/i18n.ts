export type Locale = 'es' | 'en'

export const LOCALES: Locale[] = ['es', 'en']
export const DEFAULT_LOCALE: Locale = 'en'

type Dict = Record<string, string>

const es: Dict = {
  // Common
  'common.back': 'Volver al timeline',
  'common.home': 'Inicio',
  'common.share': 'Compartir',
  'common.copied': 'Copiado',
  'common.figures': 'personajes',
  'common.figure': 'personaje',
  'common.years': 'años',
  'common.bc': 'a.C.',
  'common.ad': 'd.C.',
  'common.bcShort': 'aC',
  'common.adShort': 'dC',
  'common.timeline': 'Timeline',
  'common.brand': 'Human Timeline',

  // Home header
  'home.tagline': '4000 a.C. — 2026 d.C.',
  'home.searchPlaceholder': 'Buscar personaje… Napoleón, Einstein, Cleopatra…',
  'home.search.added': 'Añadido',
  'home.civilizations': 'Civilizaciones',
  'home.random': 'Aleatorio',
  'home.clear': 'Limpiar',
  'home.playGame': 'Jugar Reto',

  // Home intro
  'home.intro.headline1': '6.000 años',
  'home.intro.headline2': 'de historia humana',
  'home.intro.subtitle': 'Busca cualquier personaje histórico y visualiza su vida en el tiempo. Descubre quiénes coexistieron, se conocieron o marcaron la misma era.',
  'home.intro.randomBtn': 'Personaje aleatorio',

  // Filters / chart
  'home.all': 'Todos',
  'home.figureCount': '{n} personaje{s}',
  'home.instructions': 'Rueda = zoom · Arrastra = mover · Clic en eje = quién vivía',
  'home.empty.title': 'Busca un personaje histórico para comenzar',
  'home.empty.sub': 'USA LA BARRA DE BÚSQUEDA ARRIBA',

  // Person card
  'person.add': 'Añadir al Timeline',
  'person.profile': 'Ficha',
  'person.wiki': 'Wiki',
  'person.birth': 'NACIMIENTO',
  'person.death': 'MUERTE',
  'person.ageAt': 'años',

  // Who was alive
  'whoAlive.title': 'Vivos en',
  'whoAlive.shortBcSuffix': 'aC',

  // Coexistences
  'coexist.title': 'Coexistencias',
  'coexist.message': '{a} y {b} coincidieron {n} años',

  // Related
  'related.title': 'Relacionados con {name}',

  // Personaje page
  'personaje.backToTimeline': 'VOLVER AL TIMELINE',
  'personaje.lifeline': 'Línea de vida',
  'personaje.biography': 'Biografía',
  'personaje.tags': 'Etiquetas',
  'personaje.contemporaries': 'Coetáneos · Vivieron al mismo tiempo',
  'personaje.related': 'Relacionados',
  'personaje.footer': '{n} personajes históricos · 4000 a.C. — 2026',

  // Chart era labels (already translated in data, but for axis)
  'chart.civilizations': 'CIVILIZACIONES',
  'chart.figure': 'PERSONAJE',

  // Game intro
  'game.tag': '· Reto Histórico ·',
  'game.title1': '¿Quién vivió',
  'game.title2': 'en este año?',
  'game.subtitle': 'Te damos un año al azar. Tú buscas un personaje histórico que viviera entonces. Cuanto más cerca, más puntos.',
  'game.mode.classic': 'Clásico',
  'game.mode.classicDesc': '10 rondas fijas. Suma todos los puntos que puedas y comparte tu marca.',
  'game.mode.classicBadge': '10 RONDAS · MÁX 100 PTS →',
  'game.mode.infinite': 'Infinito',
  'game.mode.infiniteDesc': 'Sigue jugando hasta fallar 3 veces (años no vividos). ¿Cuánto aguantas?',
  'game.mode.infiniteBadge': '3 FALLOS Y FUERA',
  'game.scoring.title': 'Sistema de puntos',
  'game.scoring.alive': 'Vivía en el año',
  'game.scoring.veryClose': '≤ 25 años',
  'game.scoring.close': '≤ 75 años',
  'game.scoring.medium': '≤ 200 años',
  'game.scoring.far': '≤ 500 años',
  'game.scoring.wrong': 'más de 500',

  // Game playing
  'game.subtitle.header': 'RETO HISTÓRICO',
  'game.round': 'RONDA',
  'game.round.infinite': 'MODO INFINITO',
  'game.points': 'Puntos',
  'game.questionLabel': '¿Quién vivió en…',
  'game.searchPlaceholder': 'Escribe el nombre de un personaje histórico…',
  'game.tapHint': 'Pulsa sobre el personaje para responder',
  'game.usedHint': '{n} personaje{s} ya usado{s} no puede{n2} repetirse',
  'game.nextRound': 'Siguiente ronda →',
  'game.seeResults': 'Ver resultados →',
  'game.refresh.label': 'Cambiar año (1 por partida)',
  'game.refresh.used': 'Comodín usado',

  // Game finished
  'game.modeClassic': 'Modo Clásico',
  'game.modeInfinite': 'Modo Infinito',
  'game.rounds': 'rondas',
  'game.misses': 'fallos',
  'game.journey': 'Tu recorrido',
  'game.shareResult': 'Compartir resultado',
  'game.playAgain': 'Otra partida',
  'game.shareText.classic': '¡He conseguido {score}/100 en el Reto Histórico de Human Timeline! 🏛️\n\n¿Puedes superarlo?',
  'game.shareText.infinite': 'He aguantado con {score} puntos en el modo Infinito de Human Timeline 🏛️\n\n¿Aguantas tú más?',

  // Reveal messages (status)
  'reveal.alive': '¡Estaba vivo!',
  'reveal.veryClose': 'Muy cerca · {n} años de diferencia',
  'reveal.closeDist': 'Cerca · {n} años de diferencia',
  'reveal.medDist': '{n} años de diferencia',
  'reveal.farDist': 'Lejos · {n} años',
  'reveal.veryFarDist': 'Muy lejos · {n} años',
  'reveal.wrongEra': 'Era equivocada · {n} años',

  // Result page / OG
  'result.header': 'RESULTADO',
  'result.maxLabel': '/100',
  'result.playYourself': 'Jugar tú',
  'result.shareLink': 'Compartir enlace',
  'result.footer': 'Human Timeline es un timeline interactivo de 6.000 años de historia humana. ¿Crees que puedes hacerlo mejor?',

  // Categories
  'cat.Politician': 'Político',
  'cat.Scientist': 'Científico',
  'cat.Artist': 'Artista',
  'cat.Writer': 'Escritor',
  'cat.Military Leader': 'Militar',
  'cat.Philosopher': 'Filósofo',
  'cat.Explorer': 'Explorador',
  'cat.Religious Figure': 'Religioso',
  'cat.Mathematician': 'Matemático',
  'cat.Inventor': 'Inventor',
  'cat.Musician': 'Músico',
  'cat.Architect': 'Arquitecto',
  'cat.Athlete': 'Deportista',
  'cat.Filmmaker': 'Cineasta',

  // Ratings
  'rating.master': 'Maestro de la Historia',
  'rating.brilliant': 'Historiador Brillante',
  'rating.advanced': 'Aprendiz Avanzado',
  'rating.curious': 'Curioso del Tiempo',
  'rating.traveler': 'Viajero Perdido',
  'rating.review': 'Necesitas Repasar',
}

const en: Dict = {
  'common.back': 'Back to timeline',
  'common.home': 'Home',
  'common.share': 'Share',
  'common.copied': 'Copied',
  'common.figures': 'figures',
  'common.figure': 'figure',
  'common.years': 'years',
  'common.bc': 'BC',
  'common.ad': 'AD',
  'common.bcShort': 'BC',
  'common.adShort': 'AD',
  'common.timeline': 'Timeline',
  'common.brand': 'Human Timeline',

  'home.tagline': '4000 BC — 2026 AD',
  'home.searchPlaceholder': 'Search a figure… Napoleon, Einstein, Cleopatra…',
  'home.search.added': 'Added',
  'home.civilizations': 'Civilizations',
  'home.random': 'Random',
  'home.clear': 'Clear',
  'home.playGame': 'Play Challenge',

  'home.intro.headline1': '6,000 years',
  'home.intro.headline2': 'of human history',
  'home.intro.subtitle': 'Search any historical figure and visualize their life on a timeline. Discover who coexisted, who met and who shaped the same era.',
  'home.intro.randomBtn': 'Random figure',

  'home.all': 'All',
  'home.figureCount': '{n} figure{s}',
  'home.instructions': 'Wheel = zoom · Drag = move · Click on axis = who lived',
  'home.empty.title': 'Search a historical figure to begin',
  'home.empty.sub': 'USE THE SEARCH BAR ABOVE',

  'person.add': 'Add to Timeline',
  'person.profile': 'Profile',
  'person.wiki': 'Wiki',
  'person.birth': 'BIRTH',
  'person.death': 'DEATH',
  'person.ageAt': 'years',

  'whoAlive.title': 'Alive in',
  'whoAlive.shortBcSuffix': 'BC',

  'coexist.title': 'Coexistences',
  'coexist.message': '{a} and {b} coexisted for {n} years',

  'related.title': 'Related to {name}',

  'personaje.backToTimeline': 'BACK TO TIMELINE',
  'personaje.lifeline': 'Lifeline',
  'personaje.biography': 'Biography',
  'personaje.tags': 'Tags',
  'personaje.contemporaries': 'Contemporaries · Lived at the same time',
  'personaje.related': 'Related',
  'personaje.footer': '{n} historical figures · 4000 BC — 2026',

  'chart.civilizations': 'CIVILIZATIONS',
  'chart.figure': 'FIGURE',

  'game.tag': '· Historical Challenge ·',
  'game.title1': 'Who lived',
  'game.title2': 'in this year?',
  'game.subtitle': 'We give you a random year. Search for a historical figure who lived back then. The closer, the more points.',
  'game.mode.classic': 'Classic',
  'game.mode.classicDesc': '10 fixed rounds. Score as many points as you can and share your mark.',
  'game.mode.classicBadge': '10 ROUNDS · MAX 100 PTS →',
  'game.mode.infinite': 'Infinite',
  'game.mode.infiniteDesc': 'Keep playing until you miss 3 times (years not lived). How long can you last?',
  'game.mode.infiniteBadge': '3 MISSES AND YOU\'RE OUT',
  'game.scoring.title': 'Scoring system',
  'game.scoring.alive': 'Lived in the year',
  'game.scoring.veryClose': '≤ 25 years',
  'game.scoring.close': '≤ 75 years',
  'game.scoring.medium': '≤ 200 years',
  'game.scoring.far': '≤ 500 years',
  'game.scoring.wrong': 'more than 500',

  'game.subtitle.header': 'HISTORICAL CHALLENGE',
  'game.round': 'ROUND',
  'game.round.infinite': 'INFINITE MODE',
  'game.points': 'Points',
  'game.questionLabel': 'Who lived in…',
  'game.searchPlaceholder': 'Type the name of a historical figure…',
  'game.tapHint': 'Click on a figure to answer',
  'game.usedHint': '{n} figure{s} already used can\'t be repeated',
  'game.nextRound': 'Next round →',
  'game.seeResults': 'See results →',
  'game.refresh.label': 'Skip year (1 per game)',
  'game.refresh.used': 'Skip used',

  'game.modeClassic': 'Classic Mode',
  'game.modeInfinite': 'Infinite Mode',
  'game.rounds': 'rounds',
  'game.misses': 'misses',
  'game.journey': 'Your journey',
  'game.shareResult': 'Share result',
  'game.playAgain': 'Another game',
  'game.shareText.classic': 'I scored {score}/100 in the Human Timeline Historical Challenge! 🏛️\n\nCan you beat it?',
  'game.shareText.infinite': 'I made it to {score} points in Human Timeline\'s Infinite mode 🏛️\n\nCan you last longer?',

  'reveal.alive': 'They were alive!',
  'reveal.veryClose': 'Very close · {n} years apart',
  'reveal.closeDist': 'Close · {n} years apart',
  'reveal.medDist': '{n} years apart',
  'reveal.farDist': 'Far · {n} years',
  'reveal.veryFarDist': 'Very far · {n} years',
  'reveal.wrongEra': 'Wrong era · {n} years',

  'result.header': 'RESULT',
  'result.maxLabel': '/100',
  'result.playYourself': 'Play yourself',
  'result.shareLink': 'Share link',
  'result.footer': 'Human Timeline is an interactive timeline of 6,000 years of human history. Think you can do better?',

  // Categories (same in English, just use the key)
  'cat.Politician': 'Politician',
  'cat.Scientist': 'Scientist',
  'cat.Artist': 'Artist',
  'cat.Writer': 'Writer',
  'cat.Military Leader': 'Military Leader',
  'cat.Philosopher': 'Philosopher',
  'cat.Explorer': 'Explorer',
  'cat.Religious Figure': 'Religious Figure',
  'cat.Mathematician': 'Mathematician',
  'cat.Inventor': 'Inventor',
  'cat.Musician': 'Musician',
  'cat.Architect': 'Architect',
  'cat.Athlete': 'Athlete',
  'cat.Filmmaker': 'Filmmaker',

  'rating.master': 'History Master',
  'rating.brilliant': 'Brilliant Historian',
  'rating.advanced': 'Advanced Apprentice',
  'rating.curious': 'Time Curious',
  'rating.traveler': 'Lost Traveler',
  'rating.review': 'Need to Review',
}

const dicts: Record<Locale, Dict> = { es, en }

export function translate(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  let msg = dicts[locale]?.[key] ?? dicts[DEFAULT_LOCALE][key] ?? key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      msg = msg.replaceAll(`{${k}}`, String(v))
    }
    // Pluralization helpers
    const nNum = typeof vars.n === 'number' ? vars.n : parseInt(String(vars.n ?? '0'))
    msg = msg.replaceAll('{s}', nNum === 1 ? '' : 's')
    msg = msg.replaceAll('{n2}', nNum === 1 ? '' : locale === 'es' ? 'n' : '')
  }
  return msg
}

export function formatYear(year: number, locale: Locale): string {
  if (year < 0) return `${Math.abs(year)} ${translate(locale, 'common.bc')}`
  return `${year} ${translate(locale, 'common.ad')}`
}

export function formatYearShort(year: number, locale: Locale): string {
  if (year < 0) return `${Math.abs(year)} ${translate(locale, 'common.bcShort')}`
  return `${year}`
}
