import { useState } from 'react'
import { addSet, deleteSet, updateSet } from '../data/repository.js'
import { fmtDate } from '../utils/format.js'
import Timer from '../components/Timer.jsx'
import SetsList from '../components/SetsList.jsx'
import { ExerciseNameInput, WeightInput, RepsInput } from '../components/SetFields.jsx'

// Стили экрана: отдельного CSS-файла нет, компонент несёт их с собой
const styles = {
  h1: { fontSize: '1.4rem' },
  workoutHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  secondaryBtn: {
    background: 'transparent',
    border: '1px solid #9aa0a6',
    borderRadius: 10,
    padding: '8px 14px',
    color: '#9aa0a6',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  row: {
    display: 'flex',
    gap: 10,
  },
}

export default function ActiveWorkout({ db, trainingId, updateDb, onFinish }) {
  // Черновик нового подхода
  const [exerciseName, setExerciseName] = useState('')
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [startedAt, setStartedAt] = useState(null) // ISO-строка или null (таймер не идёт)

  const sets = db.sets.filter((s) => s.training_id === trainingId)

  function toggleTimer() {
    if (!startedAt) {
      // СТАРТ: запоминаем текущее время
      setStartedAt(new Date().toISOString())
    } else {
      // СТОП: записываем подход в "базу"
      const finishedAt = new Date().toISOString()
      updateDb((d) => addSet(d, trainingId, { exerciseName, weight, reps, startedAt, finishedAt }))
      setStartedAt(null)
      setReps('') // повторы сбрасываем, вес и название оставляем — обычно следующий подход тот же
    }
  }

  // Сохранить правки подхода в "базу"
  function saveEdit(setId, draft) {
    updateDb((d) => updateSet(d, setId, draft))
  }

  // Удалить подход
  function removeSet(id) {
    updateDb((d) => deleteSet(d, id))
  }

  return (
    <div>
      <div style={styles.workoutHeader}>
        <h1 style={styles.h1}>Тренировка {fmtDate(new Date())}</h1>
        <button style={styles.secondaryBtn} onClick={onFinish}>Завершить</button>
      </div>

      {/* Верх: ввод упражнения */}
      <ExerciseNameInput value={exerciseName} onChange={setExerciseName} />
      <div style={styles.row}>
        <WeightInput value={weight} onChange={setWeight} />
        <RepsInput value={reps} onChange={setReps} />
      </div>

      {/* Середина: таймер подхода */}
      <Timer startedAt={startedAt} onToggle={toggleTimer} />

      {/* Низ: список сделанных подходов */}
      <SetsList db={db} sets={sets} onSaveEdit={saveEdit} onDelete={removeSet} />
    </div>
  )
}
