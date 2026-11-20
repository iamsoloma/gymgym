// Утилиты форматирования значений для отображения

// ISO-строка -> «ЧЧ:ММ:СС»
export function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// ISO-строка -> «ЧЧ:ММ» (заголовок активной тренировки)
export function fmtDate(date) {
  return new Date(date).toLocaleDateString('ru-RU')
}

// Вес подхода: null -> «свой вес», иначе «N кг»
export function fmtWeight(weightKg) {
  return weightKg === null ? 'свой вес' : weightKg + ' кг'
}

// Прошедшие секунды -> «ММ:СС»
export function fmtElapsed(totalSeconds) {
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0')
  const ss = String(totalSeconds % 60).padStart(2, '0')
  return `${mm}:${ss}`
}
