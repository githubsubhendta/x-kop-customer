// chatNotificationService.js
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';

/**
 * Create the default notification channel for chat messages
 */
export async function setupChatNotificationChannel() {
  try {
    await notifee.createChannel({
      id: 'chat',
      name: 'Chat Messages',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
    });
  } catch (error) {
    console.error('Error creating chat notification channel:', error);
  }
}

/**
 * Display a local notification for a new chat message
 */
export async function showChatNotification({ title, body, data }) {
  await setupChatNotificationChannel();

  await notifee.displayNotification({
    title: title || 'New Message',
    body: body || 'You have a new chat message.',
    data: data || {},
    android: {
      channelId: 'chat',
      smallIcon: 'ic_notification',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      pressAction: {
        id: 'default',
      },
    },
  });
}

/**
 * Handle background chat messages from Firebase
 */
export async function handleChatBackgroundMessage(remoteMessage) {
  try {
    const payload = remoteMessage?.data || {};
    await showChatNotification({
      title: payload.title || 'New Chat Message',
      body: payload.body || payload.message || 'You have a new message.',
      data: payload,
    });
  } catch (error) {
    console.error('Error handling chat background message:', error);
  }
}

/**
 * Initialize Firebase background message handler for chat notifications
 */
export function initializeChatMessaging() {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    // Check if it's a chat message type
    if (remoteMessage?.data?.type === 'chat') {
      await handleChatBackgroundMessage(remoteMessage);
    }
  });
}
