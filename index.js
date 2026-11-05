import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { initDatabase } from './src/db/database';

// Инициализируем базу данных при запуске приложения
initDatabase().then(() => {
  console.log('Database initialized');
}).catch(error => {
  console.error('Database initialization error:', error);
});

AppRegistry.registerComponent(appName, () => App);
