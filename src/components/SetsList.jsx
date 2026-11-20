// Список подходов активной тренировки (режим тренировки, карточки с правкой/удалением)

import SetItem from './SetItem.jsx'

// Стили компонента: отдельного CSS-файла нет
const styles = {
  h2: {
    fontSize: '1.1rem',
    color: '#9aa0a6',
  },
  list: {
    listStyle: 'none',
    padding: 0,
  },
}

export default function SetsList({ db, sets, onSaveEdit, onDelete }) {
  return (
    <>
      <h2 style={styles.h2}>Подходы ({sets.length})</h2>
      <ul style={styles.list}>
        {sets.map((s, i) => (
          <SetItem
            key={s.id}
            db={db}
            set={s}
            index={i}
            onSaveEdit={onSaveEdit}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </>
  )
}
