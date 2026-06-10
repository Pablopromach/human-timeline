import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const filePath = join(__dirname, '..', 'data', 'figures.json')

const VALID_CATEGORIES = [
  'Político', 'Científico', 'Artista', 'Escritor', 'Militar',
  'Filósofo', 'Explorador', 'Religioso', 'Matemático', 'Inventor',
  'Músico', 'Arquitecto',
]

const REQUIRED_FIELDS = ['id', 'name', 'birthYear', 'deathYear', 'country', 'category', 'description', 'wikipedia']

// Colors for terminal output
const c = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
}

let raw
try {
  raw = readFileSync(filePath, 'utf-8')
} catch (err) {
  console.error(c.red(`✗ No se puede leer ${filePath}`))
  console.error(err.message)
  process.exit(1)
}

let figures
try {
  figures = JSON.parse(raw)
} catch (err) {
  console.error(c.red('✗ JSON inválido — error de sintaxis:'))
  console.error('  ' + err.message)
  console.error(c.yellow('\n💡 Comprueba: comas faltantes entre objetos, comillas sin cerrar, llaves/corchetes desbalanceados.'))
  process.exit(1)
}

if (!Array.isArray(figures)) {
  console.error(c.red('✗ El archivo no es un array JSON'))
  process.exit(1)
}

const errors = []
const warnings = []
const ids = new Map()
const names = new Map()

for (let i = 0; i < figures.length; i++) {
  const f = figures[i]
  const pos = `[${i}] (id: ${f?.id ?? '?'}, "${f?.name ?? '?'}")`

  // Required fields
  for (const field of REQUIRED_FIELDS) {
    if (f[field] === undefined || f[field] === null || f[field] === '') {
      errors.push(`${pos} falta el campo "${field}"`)
    }
  }

  // ID checks
  if (typeof f.id !== 'number' || !Number.isInteger(f.id)) {
    errors.push(`${pos} id debe ser un entero`)
  } else if (ids.has(f.id)) {
    errors.push(`${pos} id duplicado (también en posición ${ids.get(f.id)})`)
  } else {
    ids.set(f.id, i)
  }

  // Name uniqueness
  if (typeof f.name === 'string') {
    const key = f.name.toLowerCase().trim()
    if (names.has(key)) {
      warnings.push(`${pos} nombre repetido (también en posición ${names.get(key)})`)
    } else {
      names.set(key, i)
    }
  }

  // Year checks
  if (typeof f.birthYear !== 'number' || typeof f.deathYear !== 'number') {
    errors.push(`${pos} birthYear y deathYear deben ser números`)
  } else if (f.birthYear > f.deathYear) {
    errors.push(`${pos} birthYear (${f.birthYear}) es posterior a deathYear (${f.deathYear})`)
  } else if (f.deathYear - f.birthYear > 130) {
    warnings.push(`${pos} vivió ${f.deathYear - f.birthYear} años — ¿es correcto?`)
  } else if (f.birthYear < -4000 || f.deathYear > 2026) {
    warnings.push(`${pos} fuera del rango temporal (-4000 a 2026)`)
  }

  // Category
  if (f.category && !VALID_CATEGORIES.includes(f.category)) {
    errors.push(`${pos} categoría "${f.category}" no válida. Usa: ${VALID_CATEGORIES.join(', ')}`)
  }

  // Wikipedia URL
  if (f.wikipedia && typeof f.wikipedia === 'string' && !f.wikipedia.startsWith('http')) {
    warnings.push(`${pos} la URL de Wikipedia parece incompleta`)
  }

  // relatedIds existence (warn only)
  if (Array.isArray(f.relatedIds)) {
    for (const relId of f.relatedIds) {
      if (typeof relId !== 'number') {
        errors.push(`${pos} relatedIds contiene un valor no numérico: ${relId}`)
      }
    }
  }
}

// Second pass: verify relatedIds actually exist
const allIds = new Set(ids.keys())
for (let i = 0; i < figures.length; i++) {
  const f = figures[i]
  if (Array.isArray(f.relatedIds)) {
    for (const relId of f.relatedIds) {
      if (typeof relId === 'number' && !allIds.has(relId)) {
        warnings.push(`[${i}] (id: ${f.id}, "${f.name}") relatedId ${relId} no existe`)
      }
    }
  }
}

// Output
console.log()
console.log(c.bold(c.cyan(`📊 Validación de data/figures.json`)))
console.log(c.dim('───────────────────────────────────────'))
console.log(`Total de personajes:  ${c.bold(figures.length)}`)
console.log(`IDs únicos:           ${c.bold(ids.size)}`)
console.log(`Errores:              ${errors.length > 0 ? c.red(c.bold(errors.length)) : c.green('0')}`)
console.log(`Avisos:               ${warnings.length > 0 ? c.yellow(c.bold(warnings.length)) : c.green('0')}`)

if (errors.length > 0) {
  console.log()
  console.log(c.red(c.bold('❌ ERRORES (debes corregirlos):')))
  errors.slice(0, 20).forEach(e => console.log('  ' + c.red('✗') + ' ' + e))
  if (errors.length > 20) console.log(c.dim(`  … y ${errors.length - 20} más`))
}

if (warnings.length > 0) {
  console.log()
  console.log(c.yellow(c.bold('⚠️  AVISOS (revisar):')))
  warnings.slice(0, 15).forEach(w => console.log('  ' + c.yellow('!') + ' ' + w))
  if (warnings.length > 15) console.log(c.dim(`  … y ${warnings.length - 15} más`))
}

console.log()
if (errors.length === 0) {
  // Suggest next available ID
  const maxId = Math.max(...ids.keys())
  console.log(c.green(c.bold('✓ Todo OK. Puedes hacer push tranquilo.')))
  console.log(c.dim(`   Próximo id disponible: ${maxId + 1}`))
  process.exit(0)
} else {
  console.log(c.red(c.bold('✗ Corrige los errores antes de hacer push.')))
  process.exit(1)
}
