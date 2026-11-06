import { useState } from 'react'
import TrainingList from './screens/TrainingList.jsx'
import ActiveWorkout from './screens/ActiveWorkout.jsx'
import { loadDb, saveDb } from './db.js'

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
    <div className="app">
      {activeTrainingId === null ? (
        <TrainingList
          db={db}
          onStart={() => {
            const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD из браузера
            let id
            updateDb((d) => {
              id = d.nextId.training++
              d.trainings.push({ id, date: today })
            })
            setActiveTrainingId(id)
          }}
          onOpenTraining={(id)=>setActiveTrainingId(id)}
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