// /**
//  * @format
//  */

// import {AppRegistry} from 'react-native';
// import App from './App';
// import {name as appName} from './app.json';
// import { setupNotificationChannel, initializeFirebaseMessaging, setupNotificationListeners,handleBackgroundMessage } from './src/notification/callNotificationService.js';
// import messaging from '@react-native-firebase/messaging';

// messaging().setBackgroundMessageHandler(async remoteMessage => {
//   console.log('[Background] Message received', remoteMessage);
//   await handleBackgroundMessage(remoteMessage);
// });

// AppRegistry.registerComponent(appName, () => () => {
//   setupNotificationChannel();
//   initializeFirebaseMessaging();
//   setupNotificationListeners();
//     return <App />;
//   });

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import notifee, {EventType} from '@notifee/react-native';
import {navigate} from './src/navigation/NavigationService';
import {
  handleBackgroundMessage,
  setupNotificationChannel,
  initializeFirebaseMessaging,
  setupNotificationListeners,
} from './src/notification/callNotificationService';
import {useEffect} from 'react';
import {handleChatBackgroundMessage} from './src/notification/chatNotificationService';

// ✅ Register FCM background message handler
// messaging().setBackgroundMessageHandler(async remoteMessage => {
//   console.log('[Background] Message received', remoteMessage);
//   await handleBackgroundMessage(remoteMessage);
// });

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('[Background] Message received', remoteMessage);

  if (remoteMessage?.data?.type === 'chat') {
    await handleChatBackgroundMessage(remoteMessage);
  } else {
    await handleBackgroundMessage(remoteMessage);
  }
});

// ✅ Register Notifee background event handler
// notifee.onBackgroundEvent(async ({ type, detail }) => {
//   const { notification, pressAction } = detail;

//   // if (type === EventType.ACTION_PRESS) {
//   //   if (pressAction.id === 'answer') {
//   //     console.log('[🔔 Notifee Background] Answer pressed');
//   //     navigate('FindAnOfficerScreen');
//   //   } else if (pressAction.id === 'decline') {
//   //     console.log('[🔔 Notifee Background] Call declined');
//   //   }
//   //   if (notification?.id) {
//   //     await notifee.cancelNotification(notification.id);
//   //   }
//   // }
// });

AppRegistry.registerComponent(appName, () => () => {
  setupNotificationChannel();
  initializeFirebaseMessaging();
  setupNotificationListeners();
  return <App />;
});
