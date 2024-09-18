/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { setupNotificationChannel, initializeFirebaseMessaging, setupNotificationListeners } from './src/notification/callNotificationService.js';

AppRegistry.registerComponent(appName, () => () => {
  setupNotificationChannel(); // Ensure the channel is set up when the app starts
  initializeFirebaseMessaging(); // Initialize Firebase messaging
  setupNotificationListeners(); // Set up Notifee background event listeners
    return <App />;
  });
