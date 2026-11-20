// Строка одного подхода в списке. Умеет переключаться в режим редактирования.
// Данные достаёт через слой repository (exerciseName), а не ищет сам.

import { useState } from 'react'
import { exerciseName } from '../data/repository.js'
import { fmtTime, fmtWeight } from '../utils/format.js'
import { ExerciseNameInput, WeightInput, RepsInput } from './SetFields.jsx'

// Стили компонента: отдельного CSS-файла нет
const styles = {
  item: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    gap: '2px 10px',
    background: '#1a1d21',
    borderRadius: 10,
    padding: '10px 14px',
    marginBottom: 8,
    boxSizing: 'border-box',
  },
  num: { color: '#9aa0a6' },
  name: { fontWeight: 600 },
  detail: { color: '#3ddc84' },
  time: {
    gridColumn: 2,
    color: '#9aa0a6',
    fontSize: '0.8rem',
  },
  iconBtn: {
    background: 'transparent',
    border: 'none',
    padding: '2px 4px',
    fontSize: '1rem',
    color: '#9aa0a6',
    cursor: 'pointer',
    alignSelf: 'center',
    boxSizing: 'border-box',
  },
  iconBtnHover: { color: '#e8eaed' },
  editRow: {
    gridColumn: '1 / -1', // строка редактирования занимает всю ширину карточки
    display: 'flex',
    gap: 8,
  },
  editInput: {
    marginBottom: 0,
    padding: '8px 10px',
    fontSize: '0.9rem',
  },
  editInputName: {
    flex: 2,
    minWidth: 0,
  },
  editInputNum: {
    flex: 1,
    minWidth: 0,
  },
  primaryBtn: {
    background: '#3ddc84',
    border: 'none',
    borderRadius: 10,
    padding: '8px 14px',
    fontSize: '0.9rem',
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
    fontSize: '0.9rem',
    color: '#9aa0a6',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
}

export default function SetItem({ db, set, index, onSaveEdit, onDelete }) {
  const [editing, setEditing] = useState(false)
  // Черновик полей на время правки
  const [draft, setDraft] = useState({ exerciseName: '', weight: '', reps: '' })
  // Инлайн-стили не поддерживают :hover и :active — отслеживаем их состоянием
  const [hoveredBtn, setHoveredBtn] = useState(null) // 'edit' | 'delete' | null
  const [pressed, setPressed] = useState(false)

  function startEdit() {
    setDraft({
      exerciseName: exerciseName(db, set.exercise_id),
      weight: set.weight_kg === null ? '' : String(set.weight_kg),
      reps: String(set.reps),
    })
    setEditing(true)
  }

  function saveEdit() {
    onSaveEdit(set.id, draft)
    setEditing(false)
  }

  if (editing) {
    return (
      <li style={styles.item}>
        {/* Режим правки: вместо текста — поля ввода */}
        <div style={styles.editRow}>
          <ExerciseNameInput
            value={draft.exerciseName}
            onChange={(v) => setDraft({ ...draft, exerciseName: v })}
            style={{ ...styles.editInput, ...styles.editInputName }}
          />
          <WeightInput
            value={draft.weight}
            onChange={(v) => setDraft({ ...draft, weight: v })}
            style={{ ...styles.editInput, ...styles.editInputNum }}
          />
          <RepsInput
            value={draft.reps}
            onChange={(v) => setDraft({ ...draft, reps: v })}
            style={{ ...styles.editInput, ...styles.editInputNum }}
          />
        </div>
        <button
          style={{ ...styles.primaryBtn, ...(pressed ? styles.primaryBtnPressed : {}) }}
          onPointerDown={() => setPressed(true)}
          onPointerUp={() => setPressed(false)}
          onPointerLeave={() => setPressed(false)}
          onPointerCancel={() => setPressed(false)}
          onClick={saveEdit}
        >
          Сохранить
        </button>
        <button style={styles.secondaryBtn} onClick={() => setEditing(false)}>Отмена</button>
      </li>
    )
  }

  return (
    <li style={styles.item}>
      <span style={styles.num}>#{index + 1}</span>
      <span style={styles.name}>{exerciseName(db, set.exercise_id)}</span>
      <span style={styles.detail}>
        {fmtWeight(set.weight_kg)} · {set.reps} повт.
      </span>
      <span style={styles.time}>
        {fmtTime(set.started_at)} – {fmtTime(set.finished_at)}
      </span>
      <button
        style={{ ...styles.iconBtn, ...(hoveredBtn === 'edit' ? styles.iconBtnHover : {}) }}
        onMouseEnter={() => setHoveredBtn('edit')}
        onMouseLeave={() => setHoveredBtn(null)}
        onClick={startEdit}
      >
        ✏️
      </button>
      <button
        style={{ ...styles.iconBtn, ...(hoveredBtn === 'delete' ? styles.iconBtnHover : {}) }}
        onMouseEnter={() => setHoveredBtn('delete')}
        onMouseLeave={() => setHoveredBtn(null)}
        onClick={() => onDelete(set.id)}
      >
        🗑
      </button>
    </li>
  )
}
