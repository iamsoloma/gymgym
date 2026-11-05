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
              console.error('Error deleting training:', error);
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
    elevation: 2,
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
