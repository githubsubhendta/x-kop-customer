// notificationService.js
import messaging from '@react-native-firebase/messaging';
import notifee, {
  AndroidCategory,
  AndroidImportance,
  EventType,
} from '@notifee/react-native';
import {navigate} from './../navigation/NavigationService.js';
import useCallStore from '../stores/call.store.js';

// Set up the notification channel
export async function setupNotificationChannel() {
  try {
    await notifee.createChannel({
      id: 'call',
      name: 'Call Notifications',
      sound: 'incoming_call',
      importance: AndroidImportance.HIGH,
      vibration: true,
      vibrationPattern: [500, 700, 900, 1100, 1300, 1500, 1700, 1800],
    });
  } catch (error) {
    console.error('Error creating notification channel:', error);
  }
}

// Handle background messages from Firebase
// Handle background messages from Firebase
export async function handleBackgroundMessage(remoteMessage) {
  try {
    await setupNotificationChannel();

    let payload = remoteMessage?.data || {};

    // Parse nested JSON if needed
    if (typeof payload.data === 'string') {
      try {
        const inner = JSON.parse(payload.data);
        payload = {...payload, ...inner};
      } catch (e) {
        console.warn('⚠️ Failed to parse inner data string:', e);
      }
    }

    // Normalize the caller info
    const callerInfo = payload?.userInfo || payload?.officer;
    if (!callerInfo || !callerInfo.mobile) {
      console.error(
        '❌ Invalid call payload: missing userInfo or officer',
        payload,
      );
      return;
    }

    // Prepare safe stringified data
    const safeData = Object.entries({
      ...payload,
      rtcMessage: JSON.stringify(payload.rtcMessage || {}),
      userInfo: JSON.stringify(payload.userInfo || {}),
    }).reduce((acc, [key, value]) => {
      acc[key] = typeof value === 'string' ? value : JSON.stringify(value);
      return acc;
    }, {});

    const messageType = payload?.type || 'default';

    if (messageType === 'incoming_call' || messageType === 'call') {
      await notifee.displayNotification({
        title: payload.title || 'Incoming Call',
        body: payload.body || 'You have an incoming call.',
        data: safeData,
        android: {
          channelId: 'call',
          category: AndroidCategory.CALL,
          importance: AndroidImportance.HIGH,
          fullScreenIntent: true,
          sound: 'incoming_call',
          smallIcon: 'ic_notification',
          color: '#4CAF50',
          largeIcon: 'ic_launcher',
          vibrationPattern: [500, 700, 900, 1100, 1300, 1500],
          pressAction: {
            id: 'default',
            launchActivity: 'default',
          },
          actions: [
            {
              title: '<p style="color: #128111;"><b>Accept</b></p>',
              pressAction: {
                id: 'answer',
                launchActivity: 'com.xkopconsultancy.xkop.MainActivity',
              },
              icon: 'ic_answer_icon',
            },
            {
              title: '<p style="color: #f44336;"> <b>Reject</b></p>',
              pressAction: {
                id: 'decline',
              },
              icon: 'ic_decline_icon',
            },
          ],
        },
      });
    } else {
      await notifee.displayNotification({
        title: payload.title || 'Notification',
        body: payload.body || 'You have a new notification.',
        data: safeData,
        android: {
          channelId: 'default',
          sound: 'default',
          vibrationPattern: [500, 700, 500, 700],
        },
      });
    }
  } catch (error) {
    console.error('❗ Error handling background message:', error);
  }
}

export function setupNotificationListeners() {
  notifee.onBackgroundEvent(async ({type, detail}) => {
    const {notification, pressAction} = detail;

    if (type === EventType.ACTION_PRESS && pressAction.id === 'answer') {
      try {
        const payload = notification?.data;
        if (payload) {
          console.log('[NotificationService] Answer button pressed:', payload);
          const useCallStore = require('../stores/call.store.js').default;
          useCallStore.getState().setBackgroundCallPayload(payload);
        }

        await notifee.cancelNotification(notification.id);
      } catch (error) {
        console.error('❗ Error handling answer action:', error);
      }
    }
  });
}

export function initializeFirebaseMessaging() {
  messaging().setBackgroundMessageHandler(handleBackgroundMessage);
}
