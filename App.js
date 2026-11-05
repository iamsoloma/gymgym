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
