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

// Возвращает id упражнения с таким названием, создаёт новое, если ещё нет
export function getOrCreateExerciseId(db, name) {
  const trimmed = name.trim()
  const found = db.exercises.find((e) => e.name.toLowerCase() === trimmed.toLowerCase())
  if (found) return found.id
  const id = db.nextId.exercise++
  db.exercises.push({ id, name: trimmed })
  return id
}
