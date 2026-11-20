// Слой хранения. Повторяет схему из shema.sql репозитория gymgym:
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
