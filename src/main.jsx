import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Отдельного CSS-файла больше нет, поэтому базовые стили документа задаём из точки входа
Object.assign(document.body.style, {
  margin: '0',
  background: '#0f1113',
  color: '#e8eaed',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  colorScheme: 'dark',
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
