// Хранилище данных. Повторяет схему из shema.sql репозитория gymgym:
// trainings(id, date), exercises(id, name), sets(id, training_id, exercise_id, weight_kg, reps, started_at, finished_at)
// Данные лежат в localStorage браузера — переживают перезагрузку страницы.

const KEY = 'gymgym-data'

// Пустая структура — как пустые таблицы в SQL
function emptyDb() {
  return { trainings: [], exercises: [], sets: [], nextId: { training: 1, exercise: 1, set: 1 } }
}

export function loadDb() {
  const raw = localStorage.getItem(KEY)
  if (!raw) return emptyDb()
  try {
    return JSON.parse(raw)
  } catch {
    return emptyDb()
  }
}

export function saveDb(db) {
  localStorage.setItem(KEY, JSON.stringify(db))
}

// Формирует CSV со всеми данными "базы" (одна строка = один подход).
// Схема повторяет shema.sql: trainings(id, date), exercises(id, name),
// sets(id, training_id, exercise_id, weight_kg, reps, started_at, finished_at)
export function dbToCsv(db) {
  const header = ['set_id', 'training_id', 'training_date', 'exercise_id', 'exercise_name', 'weight_kg', 'reps', 'started_at', 'finished_at']
  const rows = []
  for (const training of db.trainings) {
    const sets = db.sets.filter((s) => s.training_id === training.id)
    for (const s of sets) {
      const exercise = db.exercises.find((e) => e.id === s.exercise_id)
      rows.push([
        s.id,
        training.id,
        training.date,
        s.exercise_id,
        exercise ? exercise.name : '',
        s.weight_kg === null || s.weight_kg === undefined ? '' : s.weight_kg,
        s.reps,
        s.started_at ?? '',
        s.finished_at ?? '',
      ])
    }
  }
  return [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\r\n')
}

// Экранирование значения по правилам CSV: кавычки удваиваются,
// значение целиком берётся в кавычки, если содержит спецсимволы
function csvEscape(value) {
  const str = String(value)
  if (/[",\r\n;]/.test(str)) return '"' + str.replace(/"/g, '""') + '"'
  return str
}

// Скачивает CSV-файл с текущими данными браузера
export function downloadCsv(db) {
  // BOM, чтобы Excel правильно понял кириллицу
  const blob = new Blob(['\uFEFF' + dbToCsv(db)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `gymgym-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

// Возвращает id упражнения с таким названием, создаёт новое, если ещё нет
export function getOrCreateExerciseId(db, name) {
  const trimmed = name.trim()
  const found = db.exercises.find((e) => e.name.toLowerCase() === trimmed.toLowerCase())
  if (found) return found.id
  const id = db.nextId.exercise++
  db.exercises.push({ id, name: trimmed })
  return id
}
