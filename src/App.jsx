import { useState } from 'react'
import TrainingList from './screens/TrainingList.jsx'
import ActiveWorkout from './screens/ActiveWorkout.jsx'
import { loadDb, saveDb } from './data/db.js'
import { createTraining } from './data/repository.js'

// Стили корневого контейнера живут здесь же, отдельного CSS-файла нет
const appStyle = {
  maxWidth: 640,
  margin: '0 auto',
  padding: 16,
  boxSizing: 'border-box',
}

export default function App() {
  // db — вся "база" в состоянии React
  const [db, setDb] = useState(loadDb)
  // null = список тренировок, число = id активной тренировки
  const [activeTrainingId, setActiveTrainingId] = useState(null)

  // Все изменения базы идут через эту функцию + сразу сохраняются
  function updateDb(mutator) {
    setDb((prev) => {
      const next = structuredClone(prev)
      mutator(next)
      saveDb(next)
      return next
    })
  }

  return (
    <div style={appStyle}>
      {activeTrainingId === null ? (
        <TrainingList
          db={db}
          onStart={() => {
            let id
            updateDb((d) => {
              id = createTraining(d)
            })
            setActiveTrainingId(id)
          }}
          onOpenTraining={(id) => setActiveTrainingId(id)}
        />
      ) : (
        <ActiveWorkout
          db={db}
          trainingId={activeTrainingId}
          updateDb={updateDb}
          onFinish={() => setActiveTrainingId(null)}
        />
      )}
    </div>
  )
}
