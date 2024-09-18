import messaging from '@react-native-firebase/messaging';
import { Alert } from 'react-native';

export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }
}


export async function notificationListeners() {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
        Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
      });
  
      messaging().onNotificationOpenedApp(remoteMessage => {
        // const url = buildDeepLinkFromNotificationData(remoteMessage.data)
        // if (typeof url === 'string') {
        //   listener(url)
        // }

      });

  messaging().getInitialNotification().then(remoteMessage=>{
    if (remoteMessage) {
        Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    }
  })

      return unsubscribe;
    
}