// Таблица подходов одной тренировки (режим списка тренировок, только просмотр)

import { exerciseName } from '../data/repository.js'
import { fmtTime } from '../utils/format.js'

// Стили компонента: отдельного CSS-файла нет.
// В инлайн-стилях нет селекторов, поэтому стили ячеек задаются каждой ячейке отдельно.
const styles = {
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.85rem',
    boxSizing: 'border-box',
  },
  th: {
    textAlign: 'left',
    padding: '4px 8px 4px 0',
    borderTop: 'none',
    color: '#9aa0a6',
    fontWeight: 500,
  },
  td: {
    textAlign: 'left',
    padding: '4px 8px 4px 0',
    borderTop: '1px solid #2a2e33',
  },
}

export default function SetsTable({ db, sets }) {
  return (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>№</th>
          <th style={styles.th}>Упражнение</th>
          <th style={styles.th}>Вес</th>
          <th style={styles.th}>Повт.</th>
          <th style={styles.th}>Начало</th>
          <th style={styles.th}>Конец</th>
        </tr>
      </thead>
      <tbody>
        {sets.map((s, i) => (
          <tr key={s.id}>
            <td style={styles.td}>{i + 1}</td>
            <td style={styles.td}>{exerciseName(db, s.exercise_id)}</td>
            <td style={styles.td}>{s.weight_kg === null ? '—' : s.weight_kg + ' кг'}</td>
            <td style={styles.td}>{s.reps}</td>
            <td style={styles.td}>{fmtTime(s.started_at)}</td>
            <td style={styles.td}>{fmtTime(s.finished_at)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
