import { useState, useEffect } from 'react'
import { getOrCreateExerciseId } from '../db.js'

export default function ActiveWorkout({ db, trainingId, updateDb, onFinish }) {
  const [exerciseName, setExerciseName] = useState('')
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [startedAt, setStartedAt] = useState(null) // ISO-строка или null (таймер не идёт)
  // eslint-disable-next-line react-hooks/purity
  const [now, setNow] = useState(Date.now())       // для перерисовки секундомера
  // Редактирование подхода: id подхода, который правим, + черновик его полей
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState({ exerciseName: '', weight: '', reps: '' })

  const sets = db.sets.filter((s) => s.training_id === trainingId)

  // Каждую секунду обновляем now, пока идёт таймер — секундомер "тикает"
  useEffect(() => {
    if (!startedAt) return
    const t = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(t)
  }, [startedAt])

  function toggleTimer() {
    if (!startedAt) {
      // СТАРТ: запоминаем текущее время
      setStartedAt(new Date().toISOString())
    } else {
      // СТОП: записываем подход в "базу"
      const finishedAt = new Date().toISOString()
      updateDb((d) => {
        const exerciseId = getOrCreateExerciseId(d, exerciseName || 'Без названия')
        d.sets.push({
          id: d.nextId.set++,
          training_id: trainingId,
          exercise_id: exerciseId,
          weight_kg: weight === '' ? null : Number(weight),
          reps: reps === '' ? 1 : Number(reps),
          started_at: startedAt,
          finished_at: finishedAt,
        })
      })
      setStartedAt(null)
      setReps('') // повторы сбрасываем, вес и название оставляем — обычно следующий подход тот же
    }
  }

  // Открыть редактирование: заполнить черновик текущими значениями подхода
  function startEdit(s) {
    setEditingId(s.id)
    setDraft({
      exerciseName: db.exercises.find((e) => e.id === s.exercise_id)?.name ?? '',
      weight: s.weight_kg === null ? '' : String(s.weight_kg),
      reps: String(s.reps),
    })
  }

  // Сохранить правки подхода в "базу"
  function saveEdit() {
    updateDb((d) => {
      const s = d.sets.find((x) => x.id === editingId)
      if (!s) return
      s.exercise_id = getOrCreateExerciseId(d, draft.exerciseName || 'Без названия')
      s.weight_kg = draft.weight === '' ? null : Number(draft.weight)
      s.reps = draft.reps === '' ? 1 : Number(draft.reps)
    })
    setEditingId(null)
  }

  // Удалить подход
  function deleteSet(id) {
    updateDb((d) => {
      d.sets = d.sets.filter((x) => x.id !== id)
    })
  }

  const elapsed = startedAt ? Math.floor((now - new Date(startedAt).getTime()) / 1000) : 0
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const ss = String(elapsed % 60).padStart(2, '0')

  const exerciseTitle = (id) => db.exercises.find((e) => e.id === id)?.name ?? '—'

  return (
    <div className="screen">
      <div className="workout-header">
        <h1>Тренировка {new Date().toLocaleDateString('ru-RU')}</h1>
        <button className="btn-secondary" onClick={onFinish}>Завершить</button>
      </div>

      {/* Верх: ввод упражнения */}
      <input
        className="input"
        placeholder="Название упражнения (напр. Жим ногами)"
        value={exerciseName}
        onChange={(e) => setExerciseName(e.target.value)}
      />
      <div className="row">
        <input
          className="input"
          type="number"
          placeholder="Вес, кг (пусто = своё)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
        <input
          className="input"
          type="number"
          placeholder="Повторения"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
        />
      </div>

      {/* Середина: таймер подхода */}
      <div className="timer-block">
        <div className={'timer ' + (startedAt ? 'timer-run' : '')}>{mm}:{ss}</div>
        <button className={'btn-primary btn-timer ' + (startedAt ? 'btn-stop' : '')} onClick={toggleTimer}>
          {startedAt ? '■ Стоп' : '▶ Старт'}
        </button>
      </div>

      {/* Низ: список сделанных подходов */}
      <h2>Подходы ({sets.length})</h2>
      <ul className="sets-list">
        {sets.map((s, i) => (
          <li key={s.id} className="set-item">
            {editingId === s.id ? (
              // Режим правки: вместо текста — поля ввода
              <>
                <div className="set-edit">
                  <input
                    className="input input-edit-name"
                    value={draft.exerciseName}
                    onChange={(e) => setDraft({ ...draft, exerciseName: e.target.value })}
                  />
                  <input
                    className="input input-edit-num"
                    type="number"
                    placeholder="Вес"
                    value={draft.weight}
                    onChange={(e) => setDraft({ ...draft, weight: e.target.value })}
                  />
                  <input
                    className="input input-edit-num"
                    type="number"
                    placeholder="Повт."
                    value={draft.reps}
                    onChange={(e) => setDraft({ ...draft, reps: e.target.value })}
                  />
                </div>
                <button className="btn-primary" onClick={saveEdit}>Сохранить</button>
                <button className="btn-secondary" onClick={() => setEditingId(null)}>Отмена</button>
              </>
            ) : (
              <>
                <span className="set-num">#{i + 1}</span>
                <span className="set-name">{exerciseTitle(s.exercise_id)}</span>
                <span className="set-detail">
                  {s.weight_kg === null ? 'свой вес' : s.weight_kg + ' кг'} · {s.reps} повт.
                </span>
                <span className="set-time">
                  {fmt(s.started_at)} – {fmt(s.finished_at)}
                </span>
                <button className="btn-icon" onClick={() => startEdit(s)}>✏️</button>
                <button className="btn-icon" onClick={() => deleteSet(s.id)}>🗑</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function fmt(iso) {
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}