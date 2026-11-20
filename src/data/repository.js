// Слой данных: все операции над "базой" собраны здесь.
// Компоненты не трогают данные напрямую — только вызывают эти функции.
// При переходе на настоящий API достаточно заменить тела этих функций
// на fetch-запросы, интерфейс вызовов менять не придётся.

// --- Тренировки ---

// Создаёт тренировку с сегодняшней датой, возвращает её id
export function createTraining(db) {
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD из браузера
  const id = db.nextId.training++
  db.trainings.push({ id, date: today })
  return id
}

// Возвращает тренировку по id или null
export function getTraining(db, id) {
  return db.trainings.find((t) => t.id === id) ?? null
}

// Тренировки от новых к старым + агрегаты по подходам (кол-во подходов и упражнений)
export function listTrainings(db) {
  return [...db.trainings]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((t) => {
      const sets = listSets(db, t.id)
      return {
        ...t,
        setsCount: sets.length,
        exercisesCount: new Set(sets.map((s) => s.exercise_id)).size,
        sets,
      }
    })
}

// --- Подходы ---

// Подходы конкретной тренировки в порядке добавления
export function listSets(db, trainingId) {
  return db.sets.filter((s) => s.training_id === trainingId)
}

// Добавляет подход; возвращает созданный объект
export function addSet(db, trainingId, { exerciseName, weight, reps, startedAt, finishedAt }) {
  const set = {
    id: db.nextId.set++,
    training_id: trainingId,
    exercise_id: getOrCreateExerciseId(db, exerciseName || 'Без названия'),
    weight_kg: weight === '' ? null : Number(weight),
    reps: reps === '' ? 1 : Number(reps),
    started_at: startedAt,
    finished_at: finishedAt,
  }
  db.sets.push(set)
  return set
}

// Обновляет подход по id; возвращает true, если найден
export function updateSet(db, setId, { exerciseName, weight, reps }) {
  const s = db.sets.find((x) => x.id === setId)
  if (!s) return false
  s.exercise_id = getOrCreateExerciseId(db, exerciseName || 'Без названия')
  s.weight_kg = weight === '' ? null : Number(weight)
  s.reps = reps === '' ? 1 : Number(reps)
  return true
}

// Удаляет подход по id
export function deleteSet(db, setId) {
  db.sets = db.sets.filter((x) => x.id !== setId)
}

// --- Упражнения ---

// Имя упражнения по id (или заглушка «—»)
export function exerciseName(db, id) {
  return db.exercises.find((e) => e.id === id)?.name ?? '—'
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

// --- Экспорт CSV ---

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
