// Поля ввода подхода. Используются в форме добавления и в редактировании,
// чтобы не дублировать разметку и обработчики.

// Базовый стиль поля: отдельного CSS-файла нет.
// style позволяет переопределить вид поля в режиме правки (раньше это делал `.set-edit .input`).
const inputStyle = {
  width: '100%',
  background: '#1a1d21',
  border: '1px solid #2a2e33',
  borderRadius: 10,
  padding: '12px 14px',
  color: '#e8eaed',
  fontSize: '1rem',
  marginBottom: 10,
  boxSizing: 'border-box',
}

export function ExerciseNameInput({ value, onChange, style }) {
  return (
    <input
      style={{ ...inputStyle, ...style }}
      placeholder="Название упражнения (напр. Жим ногами)"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

export function WeightInput({ value, onChange, style }) {
  return (
    <input
      style={{ ...inputStyle, ...style }}
      type="number"
      placeholder="Вес, кг (пусто = своё)"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

export function RepsInput({ value, onChange, style }) {
  return (
    <input
      style={{ ...inputStyle, ...style }}
      type="number"
      placeholder="Повторения"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}
