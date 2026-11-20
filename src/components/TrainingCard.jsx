// Карточка одной тренировки в списке: дата, сводка и таблица подходов

import SetsTable from './SetsTable.jsx'

// Стили компонента: отдельного CSS-файла нет
const styles = {
  card: {
    background: '#1a1d21',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    overflowX: 'auto',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  date: {
    fontWeight: 700,
    fontSize: '1.1rem',
  },
  meta: {
    color: '#9aa0a6',
    fontSize: '0.85rem',
    margin: '4px 0 10px',
  },
}

export default function TrainingCard({ db, training, onOpenTraining }) {
  return (
    <li style={styles.card} onClick={() => onOpenTraining(training.id)}>
      <div style={styles.date}>{training.date}</div>
      <div style={styles.meta}>
        {training.setsCount} подходов · {training.exercisesCount} упражнений
      </div>
      <SetsTable db={db} sets={training.sets} />
    </li>
  )
}
