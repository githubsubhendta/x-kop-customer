/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { setupNotificationChannel, initializeFirebaseMessaging, setupNotificationListeners } from './src/notification/callNotificationService.js';

AppRegistry.registerComponent(appName, () => () => {
  setupNotificationChannel(); 
  initializeFirebaseMessaging(); 
  setupNotificationListeners(); 
    return <App />;
  });
