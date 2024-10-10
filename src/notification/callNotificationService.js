// notificationService.js
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { navigate } from './../navigation/NavigationService.js';

// Set up the notification channel
export async function setupNotificationChannel() {
  try {
    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
    });
    await notifee.createChannel({
      id: 'call',
      name: 'Call Channel',
      importance: AndroidImportance.HIGH,
    });
  } catch (error) {
    console.error('Error creating notification channel:', error);
  }
}

// Handle background messages from Firebase
export async function handleBackgroundMessage(remoteMessage) {
  try {
    await setupNotificationChannel();

    // Check if the message is a call or a normal notification
    const messageType = remoteMessage.data?.type || 'default'; // Assuming 'type' field indicates the message type

    if (messageType === 'call') {
      // Handle call notifications
      await notifee.displayNotification({
        title: remoteMessage.data?.title || 'Incoming Call',
        body: remoteMessage.data?.body || 'You have an incoming call.',
        android: {
          channelId: 'call',
          sound: 'incoming_call',
          vibrationPattern: [300, 500],
          actions: [
            { title: 'Answer', pressAction: { id: 'answer' } },
            { title: 'Decline', pressAction: { id: 'decline' } },
          ],
        },
      });
    } else {
      // Handle regular message notifications
      await notifee.displayNotification({
        title: remoteMessage.data?.title || 'Default Title',
        body: remoteMessage.data?.body || 'Default Body',
        android: {
          channelId: 'default',
          sound: 'default',
          vibrationPattern: [300, 500],
        },
      });
    }
  } catch (error) {
    console.error('Error handling background message:', error);
  }
}

// Handle background notification actions
export function setupNotificationListeners() {
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    const { notification, pressAction } = detail;

    try {
      if (type === EventType.ACTION_PRESS) {
        if (pressAction.id === 'answer') {
          console.log("Redirecting to FindAnOfficerScreen...", pressAction.id);
          navigate('FindAnOfficerScreen'); // You can adjust navigation here based on your screen names
        } else if (pressAction.id === 'decline') {
          console.log("Call declined", pressAction.id);
        }
        await notifee.cancelNotification(notification.id);
      }
    } catch (error) {
      console.error('Error handling background event:', error);
    }
  });
}


export function initializeFirebaseMessaging() {
  messaging().setBackgroundMessageHandler(handleBackgroundMessage);
}
