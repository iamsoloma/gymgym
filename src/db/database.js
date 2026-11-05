import SQLite from 'react-native-sqlite-storage';

// Открываем базу данных
const db = SQLite.openDatabase(
  { name: 'gymgym.db', location: 'default' },
  () => console.log('Database opened successfully'),
  error => console.error('Database error:', error)
);

// Инициализация базы данных (создание таблиц)
export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Создаем таблицу тренировок
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS trainings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL
        );`,
        [],
        () => console.log('Trainings table created/exists')
      );

      // Создаем таблицу упражнений
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS exercises (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE
        );`,
        [],
        () => console.log('Exercises table created/exists')
      );

      // Создаем таблицу подходов
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS sets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          training_id INTEGER NOT NULL,
          exercise_id INTEGER NOT NULL,
          weight_kg REAL,
          reps INTEGER NOT NULL,
          started_at TEXT NOT NULL,
          finished_at TEXT NOT NULL,
          FOREIGN KEY (training_id) REFERENCES trainings(id),
          FOREIGN KEY (exercise_id) REFERENCES exercises(id)
        );`,
        [],
        () => console.log('Sets table created/exists')
      );
    }, resolve, reject);
  });
};

// Получение всех тренировок
export const getAllTrainings = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM trainings ORDER BY date DESC;`,
        [],
        (tx, results) => {
          const trainings = [];
          for (let i = 0; i < results.rows.length; i++) {
            trainings.push(results.rows.item(i));
          }
          resolve(trainings);
        },
        (error) => reject(error)
      );
    });
  });
};

// Создание новой тренировки
export const createTraining = (date) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO trainings (date) VALUES (?);`,
        [date],
        (tx, results) => resolve(results.insertId),
        (error) => reject(error)
      );
    });
  });
};

// Получение или создание упражнения по имени
export const getOrCreateExercise = (name) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Проверяем, существует ли упражнение
      tx.executeSql(
        `SELECT id FROM exercises WHERE name = ?;`,
        [name],
        (tx, results) => {
          if (results.rows.length > 0) {
            // Упражнение существует
            resolve(results.rows.item(0).id);
          } else {
            // Создаем новое упражнение
            tx.executeSql(
              `INSERT INTO exercises (name) VALUES (?);`,
              [name],
              (tx, results) => resolve(results.insertId),
              (error) => reject(error)
            );
          }
        },
        (error) => reject(error)
      );
    });
  });
};

// Добавление подхода
export const addSet = (trainingId, exerciseId, weightKg, reps, startedAt, finishedAt) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO sets (training_id, exercise_id, weight_kg, reps, started_at, finished_at) 
         VALUES (?, ?, ?, ?, ?, ?);`,
        [trainingId, exerciseId, weightKg, reps, startedAt, finishedAt],
        (tx, results) => resolve(results.insertId),
        (error) => reject(error)
      );
    });
  });
};

// Получение всех подходов для тренировки
export const getSetsByTraining = (trainingId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT s.*, e.name as exercise_name 
         FROM sets s 
         JOIN exercises e ON s.exercise_id = e.id 
         WHERE s.training_id = ? 
         ORDER BY s.started_at;`,
        [trainingId],
        (tx, results) => {
          const sets = [];
          for (let i = 0; i < results.rows.length; i++) {
            sets.push(results.rows.item(i));
          }
          resolve(sets);
        },
        (error) => reject(error)
      );
    });
  });
};

// Получение информации о тренировке по ID
export const getTrainingById = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM trainings WHERE id = ?;`,
        [id],
        (tx, results) => {
          if (results.rows.length > 0) {
            resolve(results.rows.item(0));
          } else {
            resolve(null);
          }
        },
        (error) => reject(error)
      );
    });
  });
};

// Удаление тренировки и всех связанных подходов
export const deleteTraining = (trainingId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Удаляем все подходы тренировки
      tx.executeSql(
        `DELETE FROM sets WHERE training_id = ?;`,
        [trainingId],
        () => {
          // Удаляем тренировку
          tx.executeSql(
            `DELETE FROM trainings WHERE id = ?;`,
            [trainingId],
            () => resolve(true),
            (error) => reject(error)
          );
        },
        (error) => reject(error)
      );
    });
  });
};

export default db;
