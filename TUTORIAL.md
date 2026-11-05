# 📱 Туториал: Создание React Native приложения для записей тренировок

Этот туториал поможет тебе создать React Native приложение для записей о походах в зал с нуля, даже если ты не знаешь React и React Native.

## 🎯 Что мы создадим

Приложение с:
- **Экраном списка тренировок** - показывает все твои тренировки
- **Экраном текущей тренировки** - для добавления новых подходов:
  - Поле ввода названия упражнения сверху
  - Кнопка старт/стоп таймера посредине
  - Список уже сделанных подходов снизу
- **Хранение данных в SQLite** - все данные сохраняются на телефоне
- **Дата по Гринвичу** - берется автоматически из телефона

---

## 🛠 Подготовка среды разработки

### 1. Установи Node.js

Скачай и установи [Node.js](https://nodejs.org/) (версия 18 или выше).

**Проверка установки:**
```bash
node -v
npm -v
```

Должны отобразиться версии Node и npm.

### 2. Установи Java Development Kit (JDK)

Для Android разработки нужен JDK 11 или 17.

**Windows/macOS:**
- Скачай с [Oracle](https://www.oracle.com/java/technologies/downloads/) или [Adoptium](https://adoptium.net/)

**Linux (Ubuntu/Debian):**
```bash
sudo apt install openjdk-17-jdk
```

### 3. Установи Android Studio

Скачай и установи [Android Studio](https://developer.android.com/studio).

**Настройка:**
1. Открой Android Studio
2. Пройди начальную настройку
3. Установи Android SDK (выбери последнюю стабильную версию)
4. Установи Android Emulator (для тестирования на виртуальном устройстве)

### 4. Установи React Native CLI

В терминале выполни:
```bash
npm install -g react-native-cli
```

---

## 🚀 Создание проекта

### 1. Создай новый проект

Открой терминал и выполни:
```bash
npx react-native init GymGymApp --template react-native-template-typescript
cd GymGymApp
```

> **Примечание:** Мы используем TypeScript шаблон, но можно использовать и обычный JavaScript, убрав `--template` часть.

### 2. Установи дополнительные зависимости

В папке проекта выполни:
```bash
npm install react-native-sqlite-storage @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context
```

### 3. Для iOS (если разрабатываешь под iOS)

```bash
cd ios && pod install && cd ..
```

---

## 📁 Структура проекта

Создай следующую структуру папок:
```
GymGymApp/
├── src/
│   ├── db/
│   │   └── database.js      # Работа с SQLite
│   ├── screens/
│   │   ├── TrainingsListScreen.js   # Список тренировок
│   │   └── CurrentTrainingScreen.js # Текущая тренировка
│   └── navigation/
│       └── AppNavigator.js   # Навигация (опционально)
├── App.js                    # Главный файл приложения
├── index.js                  # Точка входа
└── app.json                  # Конфигурация приложения
```

---

## 💾 Работа с SQLite (src/db/database.js)

Создай файл `src/db/database.js`:

```javascript
import SQLite from 'react-native-sqlite-storage';

// Открываем базу данных
const db = SQLite.openDatabase(
  { name: 'gymgym.db', location: 'default' },
  () => console.log('Database opened successfully'),
  error => console.error('Database error:', error)
);

// Инициализация базы данных
export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Таблица тренировок
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS trainings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL
        );
      `);

      // Таблица упражнений
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS exercises (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE
        );
      `);

      // Таблица подходов
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS sets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          training_id INTEGER NOT NULL,
          exercise_id INTEGER NOT NULL,
          weight_kg REAL,
          reps INTEGER NOT NULL,
          started_at TEXT NOT NULL,
          finished_at TEXT NOT NULL,
          FOREIGN KEY (training_id) REFERENCES trainings(id),
          FOREIGN KEY (exercise_id) REFERENCES exercises(id)
        );
      `);
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

// Получение или создание упражнения
export const getOrCreateExercise = (name) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT id FROM exercises WHERE name = ?;`,
        [name],
        (tx, results) => {
          if (results.rows.length > 0) {
            resolve(results.rows.item(0).id);
          } else {
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

// Получение подходов тренировки
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
```

---

## 📱 Экран списка тренировок (src/screens/TrainingsListScreen.js)

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAllTrainings, deleteTraining } from '../db/database';

const TrainingsListScreen = () => {
  const navigation = useNavigation();
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrainings();
  }, []);

  const loadTrainings = async () => {
    try {
      const data = await getAllTrainings();
      setTrainings(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading trainings:', error);
      setLoading(false);
    }
  };

  const handleNewTraining = () => {
    navigation.navigate('CurrentTraining', { trainingId: null });
  };

  const handleTrainingPress = (trainingId) => {
    navigation.navigate('CurrentTraining', { trainingId });
  };

  const handleDeleteTraining = async (trainingId) => {
    Alert.alert(
      'Удалить тренировку',
      'Вы уверены, что хотите удалить эту тренировку?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTraining(trainingId);
              await loadTrainings();
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось удалить тренировку');
            }
          }
        }
      ]
    );
  };

  const renderTrainingItem = ({ item }) => (
    <View style={styles.trainingItem}>
      <TouchableOpacity onPress={() => handleTrainingPress(item.id)}>
        <Text style={styles.trainingDate}>{item.date}</Text>
        <Text style={styles.trainingId}>ID: {item.id}</Text>
      </TouchableOpacity>
      <Button 
        title="Удалить" 
        onPress={() => handleDeleteTraining(item.id)} 
        color="red"
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Загрузка...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Список тренировок</Text>
      
      {trainings.length === 0 ? (
        <Text style={styles.emptyText}>Нет тренировок</Text>
      ) : (
        <FlatList
          data={trainings}
          renderItem={renderTrainingItem}
          keyExtractor={item => item.id.toString()}
          style={styles.list}
        />
      )}

      <Button 
        title="Новая тренировка" 
        onPress={handleNewTraining}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  trainingItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trainingDate: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  trainingId: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
});

export default TrainingsListScreen;
```

---

## 🏋️ Экран текущей тренировки (src/screens/CurrentTrainingScreen.js)

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, FlatList, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { 
  createTraining, 
  getTrainingById, 
  getOrCreateExercise, 
  addSet, 
  getSetsByTraining
} from '../db/database';

const CurrentTrainingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { trainingId } = route.params || {};

  const [exerciseName, setExerciseName] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [reps, setReps] = useState('');
  const [sets, setSets] = useState([]);
  const [currentTrainingId, setCurrentTrainingId] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const init = async () => {
      if (trainingId) {
        const training = await getTrainingById(trainingId);
        if (training) {
          setCurrentTrainingId(training.id);
          const trainingSets = await getSetsByTraining(training.id);
          setSets(trainingSets);
        }
      } else {
        const now = new Date();
        const utcDate = now.toISOString();
        const newTrainingId = await createTraining(utcDate);
        setCurrentTrainingId(newTrainingId);
      }
    };
    init();
  }, [trainingId]);

  useEffect(() => {
    let timerInterval;
    if (isTimerRunning) {
      timerInterval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [isTimerRunning]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartStopTimer = async () => {
    if (!exerciseName.trim()) {
      Alert.alert('Ошибка', 'Введите название упражнения');
      return;
    }

    if (!isTimerRunning) {
      const now = new Date();
      const utcTime = now.toISOString();
      setStartTime(utcTime);
      setElapsedTime(0);
      setIsTimerRunning(true);
    } else {
      setIsTimerRunning(false);
      
      const now = new Date();
      const utcTime = now.toISOString();
      
      const exerciseId = await getOrCreateExercise(exerciseName);
      
      const newSetId = await addSet(
        currentTrainingId,
        exerciseId,
        weightKg ? parseFloat(weightKg) : null,
        reps ? parseInt(reps) : 0,
        startTime,
        utcTime
      );
      
      const newSet = {
        id: newSetId,
        exercise_name: exerciseName,
        weight_kg: weightKg ? parseFloat(weightKg) : null,
        reps: reps ? parseInt(reps) : 0,
        started_at: startTime,
        finished_at: utcTime,
      };
      
      setSets(prev => [...prev, newSet]);
      setExerciseName('');
      setWeightKg('');
      setReps('');
    }
  };

  const renderSetItem = ({ item }) => (
    <View style={styles.setItem}>
      <View style={styles.setInfo}>
        <Text style={styles.setExercise}>{item.exercise_name || item.exerciseName}</Text>
        <Text style={styles.setDetails}>
          Вес: {item.weight_kg ? `${item.weight_kg} кг` : 'Без веса'}
        </Text>
        <Text style={styles.setDetails}>
          Повторения: {item.reps}
        </Text>
        <Text style={styles.setDetails}>
          Время: {formatTime(Math.floor((new Date(item.finished_at) - new Date(item.started_at)) / 1000))}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {trainingId ? `Тренировка #${currentTrainingId}` : 'Новая тренировка'}
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Название упражнения:</Text>
        <TextInput
          style={styles.input}
          value={exerciseName}
          onChangeText={setExerciseName}
          placeholder="Введите название упражнения"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.rowContainer}>
        <View style={styles.halfInputContainer}>
          <Text style={styles.label}>Вес (кг):</Text>
          <TextInput
            style={styles.input}
            value={weightKg}
            onChangeText={setWeightKg}
            placeholder="Вес"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.halfInputContainer}>
          <Text style={styles.label}>Повторения:</Text>
          <TextInput
            style={styles.input}
            value={reps}
            onChangeText={setReps}
            placeholder="Повторения"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
        <Button
          title={isTimerRunning ? 'Стоп' : 'Старт'}
          onPress={handleStartStopTimer}
          color={isTimerRunning ? 'red' : 'green'}
        />
      </View>

      <Text style={styles.sectionTitle}>Сделанные подходы:</Text>
      
      {sets.length === 0 ? (
        <Text style={styles.emptyText}>Нет подходов</Text>
      ) : (
        <FlatList
          data={sets}
          renderItem={renderSetItem}
          keyExtractor={item => item.id.toString()}
          style={styles.setsList}
        />
      )}

      <View style={styles.backButtonContainer}>
        <Button
          title="Назад к списку тренировок"
          onPress={() => navigation.navigate('TrainingsList')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  halfInputContainer: {
    flex: 1,
    marginRight: 10,
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  setsList: {
    flex: 1,
  },
  setItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  setInfo: {
    flex: 1,
  },
  setExercise: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  setDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  backButtonContainer: {
    marginTop: 20,
  },
});

export default CurrentTrainingScreen;
```

---

## ⚛️ Настройка навигации (App.js)

```javascript
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TrainingsListScreen from './src/screens/TrainingsListScreen';
import CurrentTrainingScreen from './src/screens/CurrentTrainingScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="TrainingsList">
        <Stack.Screen 
          name="TrainingsList" 
          component={TrainingsListScreen} 
          options={{ title: 'Тренировки' }}
        />
        <Stack.Screen 
          name="CurrentTraining" 
          component={CurrentTrainingScreen} 
          options={{ title: 'Текущая тренировка' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

---

## 🏁 Завершение настройки

### 1. Создай index.js

```javascript
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { initDatabase } from './src/db/database';

// Инициализируем базу данных
initDatabase().then(() => {
  console.log('Database initialized');
}).catch(error => {
  console.error('Database initialization error:', error);
});

AppRegistry.registerComponent(appName, () => App);
```

### 2. Создай app.json

```json
{
  "name": "GymGym",
  "displayName": "GymGym"
}
```

---

## 📱 Запуск приложения

### На Android

1. Подключи Android устройство или запусти эмулятор
2. В терминале выполни:

```bash
npx react-native run-android
```

### На iOS

1. Убедись, что у тебя есть Mac
2. В терминале выполни:

```bash
npx react-native run-ios
```

---

## 🎯 Как пользоваться приложением

1. **Создание новой тренировки:**
   - Нажми "Новая тренировка" на экране списка
   - Автоматически создастся новая тренировка с текущей датой по Гринвичу

2. **Добавление подхода:**
   - Введи название упражнения (например: "Жим штанги")
   - Введи вес (если нужно)
   - Введи количество повторений (если нужно)
   - Нажми "Старт" чтобы начать таймер
   - Нажми "Стоп" чтобы закончить подход
   - Подход автоматически сохранится в список

3. **Просмотр тренировок:**
   - Все тренировки отображаются на главном экране
   - Нажми на тренировку, чтобы просмотреть её подходы

4. **Удаление тренировки:**
   - Нажми "Удалить" рядом с тренировкой
   - Подтверди удаление

---

## 📊 Структура базы данных

```
trainings (Тренировки)
├── id (INTEGER PRIMARY KEY)
└── date (TEXT) - дата в формате ISO по Гринвичу

exercises (Упражнения)
├── id (INTEGER PRIMARY KEY)
└── name (TEXT UNIQUE) - название упражнения

sets (Подходы)
├── id (INTEGER PRIMARY KEY)
├── training_id (INTEGER) - ссылка на тренировку
├── exercise_id (INTEGER) - ссылка на упражнение
├── weight_kg (REAL) - вес в килограммах (NULL = без веса)
├── reps (INTEGER) - количество повторений
├── started_at (TEXT) - время начала в формате ISO
└── finished_at (TEXT) - время окончания в формате ISO
```

---

## 🔧 Решение проблем

### Ошибка: "Unable to resolve module"

Если видишь ошибку о том, что не может найти модуль:

```bash
npm install
npx react-native start --reset-cache
```

### Ошибка с Android SDK

Убедись, что:
1. Android Studio установлена
2. SDK установлен
3. Путь к SDK указан в переменной среды ANDROID_HOME

### Приложение не запускается на устройстве

1. Проверь, что устройство подключено
2. Выполни:

```bash
adb devices
```

Должно отобразиться твое устройство.

---

## 🎓 Следующие шаги

Когда ты освоишься с базовым приложением, можешь добавить:

1. **Редактирование подходов** - возможность изменять вес, повторения
2. **Статистика** - графики прогресса по упражнениям
3. **Экспорт данных** - сохранение в CSV или облако
4. **Темная тема** - для удобства в зале
5. **Голосовой ввод** - для быстрого добавления подходов
6. **Синхронизация** - с Google Drive или iCloud

---

## 📚 Полезные ресурсы

- [React Native Документация](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org/)
- [SQLite в React Native](https://github.com/andpor/react-native-sqlite-storage)
- [Курс по React Native на русском](https://www.youtube.com/watch?v=...)

---

## ✅ Готово!

Поздравляю! Ты создал полноценное React Native приложение для записей тренировок. Теперь ты можешь:

✅ Создавать новые тренировки
✅ Добавлять подходы с таймером
✅ Просматривать историю тренировок
✅ Удалять ненужные тренировки

Все данные хранятся на телефоне в SQLite базе данных и доступны без интернета!

Если будут вопросы - обращайся! 💪
