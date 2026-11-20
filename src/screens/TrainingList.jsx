import { useState } from 'react'
import { downloadCsv, listTrainings } from '../data/repository.js'
import TrainingCard from '../components/TrainingCard.jsx'

// Стили экрана: отдельного CSS-файла нет, компонент несёт их с собой
const styles = {
  h1: { fontSize: '1.4rem' },
  actionsRow: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
  },
  primaryBtn: {
    background: '#3ddc84',
    border: 'none',
    borderRadius: 10,
    padding: '12px 20px',
    fontSize: '1rem',
    fontWeight: 600,
    color: '#06210f',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  primaryBtnPressed: { transform: 'scale(0.97)' },
  secondaryBtn: {
    background: 'transparent',
    border: '1px solid #9aa0a6',
    borderRadius: 10,
    padding: '8px 14px',
    color: '#9aa0a6',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  empty: { color: '#9aa0a6' },
  list: {
    listStyle: 'none',
    padding: 0,
    marginTop: 16,
  },
}

export default function TrainingList({ db, onStart, onOpenTraining }) {
  // Слой данных возвращает тренировки от новых к старым с агрегатами
  const trainings = listTrainings(db)
  // Инлайн-стили не поддерживают :active, поэтому нажатие кнопки отслеживаем состоянием
  const [pressed, setPressed] = useState(false)

  return (
    <div>
      <h1 style={styles.h1}>Мои тренировки</h1>
      <div style={styles.actionsRow}>
        <button
          style={{ ...styles.primaryBtn, ...(pressed ? styles.primaryBtnPressed : {}) }}
          onPointerDown={() => setPressed(true)}
          onPointerUp={() => setPressed(false)}
          onPointerLeave={() => setPressed(false)}
          onPointerCancel={() => setPressed(false)}
          onClick={onStart}
        >
          + Новая тренировка
        </button>
        <button style={styles.secondaryBtn} onClick={() => downloadCsv(db)}>Скачать CSV</button>
      </div>

      {trainings.length === 0 && <p style={styles.empty}>Пока нет записей. Начни первую тренировку!</p>}

      <ul style={styles.list}>
        {trainings.map((t) => (
          <TrainingCard key={t.id} db={db} training={t} onOpenTraining={onOpenTraining} />
        ))}
      </ul>
    </div>
  )
}
