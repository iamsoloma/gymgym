import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, FlatList, TouchableOpacity, Alert } from 'react-native';
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
        // Загружаем существующую тренировку
        const training = await getTrainingById(trainingId);
        if (training) {
          setCurrentTrainingId(training.id);
          const trainingSets = await getSetsByTraining(training.id);
          setSets(trainingSets);
        }
      } else {
        // Создаем новую тренировку
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
      // Начало подхода
      const now = new Date();
      const utcTime = now.toISOString();
      setStartTime(utcTime);
      setElapsedTime(0);
      setIsTimerRunning(true);
    } else {
      // Окончание подхода
      setIsTimerRunning(false);
      
      const now = new Date();
      const utcTime = now.toISOString();
      
      // Получаем или создаем упражнение
      const exerciseId = await getOrCreateExercise(exerciseName);
      
      // Добавляем подход в базу
      const newSetId = await addSet(
        currentTrainingId,
        exerciseId,
        weightKg ? parseFloat(weightKg) : null,
        reps ? parseInt(reps) : 0,
        startTime,
        utcTime
      );
      
      // Добавляем подход в список
      const newSet = {
        id: newSetId,
        exercise_name: exerciseName,
        weight_kg: weightKg ? parseFloat(weightKg) : null,
        reps: reps ? parseInt(reps) : 0,
        started_at: startTime,
        finished_at: utcTime,
      };
      
      setSets(prev => [...prev, newSet]);
      
      // Очищаем поля для нового подхода
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

      {/* Поле ввода названия упражнения */}
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

      {/* Поля для веса и повторений */}
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

      {/* Кнопка старт/стоп таймера */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
        <Button
          title={isTimerRunning ? 'Стоп' : 'Старт'}
          onPress={handleStartStopTimer}
          color={isTimerRunning ? 'red' : 'green'}
        />
      </View>

      {/* Список уже сделанных подходов */}
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

      {/* Кнопка возврата */}
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
    elevation: 2,
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
