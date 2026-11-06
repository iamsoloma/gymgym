import { downloadCsv } from '../db.js'

export default function TrainingList({ db, onStart, onOpenTraining}) {
  // Сортируем от новых к старым
  const trainings = [...db.trainings].sort((a, b) => b.date.localeCompare(a.date))
  const exerciseName = (id) => db.exercises.find((e) => e.id === id)?.name ?? '—'

  return (
    <div className="screen">
      <h1>Мои тренировки</h1>
      <div className="actions-row">
        <button className="btn-primary" onClick={onStart}>+ Новая тренировка</button>
        <button className="btn-secondary" onClick={() => downloadCsv(db)}>Скачать CSV</button>
      </div>

      {trainings.length === 0 && <p className="empty">Пока нет записей. Начни первую тренировку!</p>}

      <ul className="training-list">
        {trainings.map((t) => {
          const sets = db.sets.filter((s) => s.training_id === t.id)
          return (
            <li key={t.id} className="training-card" onClick={()=> onOpenTraining(t.id)}>
              <div className="training-date">{t.date}</div>
              <div className="training-meta">
                {sets.length} подходов · {new Set(sets.map((s) => s.exercise_id)).size} упражнений
              </div>
              <table className="sets-table">
                <thead>
                  <tr><th>№</th><th>Упражнение</th><th>Вес</th><th>Повт.</th><th>Начало</th><th>Конец</th></tr>
                </thead>b
                <tbody>
                  {sets.map((s, i) => (
                    <tr key={s.id}>
                      <td>{i + 1}</td>
                      <td>{exerciseName(s.exercise_id)}</td>
                      <td>{s.weight_kg === null ? '—' : s.weight_kg + ' кг'}</td>
                      <td>{s.reps}</td>
                      <td>{fmtTime(s.started_at)}</td>
                      <td>{fmtTime(s.finished_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
