// Секундомер подхода: показывает ММ:СС и кнопку Старт/Стоп.
// Логика тика часов вынесена сюда из экрана.

import { useState, useEffect } from 'react'
import { fmtElapsed } from '../utils/format.js'

// Стили компонента: отдельного CSS-файла нет
const styles = {
  block: {
    textAlign: 'center',
    margin: '28px 0',
  },
  timer: {
    fontSize: '3.5rem',
    fontVariantNumeric: 'tabular-nums',
    fontWeight: 700,
    color: '#9aa0a6',
  },
  timerRun: { color: '#3ddc84' },
  btn: {
    background: '#3ddc84',
    border: 'none',
    borderRadius: 10,
    color: '#06210f',
    fontWeight: 600,
    cursor: 'pointer',
    boxSizing: 'border-box',
    marginTop: 12,
    minWidth: 200,
    fontSize: '1.2rem',
    padding: '16px 24px',
  },
  btnStop: {
    background: '#ff5c5c',
    color: '#2b0606',
  },
  btnPressed: { transform: 'scale(0.97)' },
}

export default function Timer({ startedAt, onToggle }) {
  // eslint-disable-next-line react-hooks/purity
  const [now, setNow] = useState(Date.now()) // для перерисовки секундомера
  // Инлайн-стили не поддерживают :active, поэтому нажатие кнопки отслеживаем состоянием
  const [pressed, setPressed] = useState(false)
  const running = startedAt ? new Date(startedAt) : null

  // Каждые полсекунды обновляем now, пока идёт таймер — секундомер "тикает"
  useEffect(() => {
    if (!running) return
    const t = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(t)
  }, [startedAt])

  const elapsed = running ? Math.floor((now - running.getTime()) / 1000) : 0

  return (
    <div style={styles.block}>
      <div style={{ ...styles.timer, ...(running ? styles.timerRun : {}) }}>{fmtElapsed(elapsed)}</div>
      <button
        style={{
          ...styles.btn,
          ...(running ? styles.btnStop : {}),
          ...(pressed ? styles.btnPressed : {}),
        }}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        onPointerCancel={() => setPressed(false)}
        onClick={onToggle}
      >
        {running ? '■ Стоп' : '▶ Старт'}
      </button>
    </div>
  )
}
