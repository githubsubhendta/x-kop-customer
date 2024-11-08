// import React, { createContext, useState, useEffect, useContext } from 'react';
// import messaging from '@react-native-firebase/messaging';
// import { PermissionsAndroid, Platform } from 'react-native';

// const FirebaseContext = createContext();

// export const useFirebase = () => useContext(FirebaseContext);

// const FirebaseProvider = ({ children }) => {
//   const [fcmToken, setFcmToken] = useState(null);

//   useEffect(() => {
//     const requestUserPermission = async () => {
//       if (Platform.OS === 'android') {
//         const granted = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
//         );

//         if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
//           console.log('Notification permission denied');
//           return;
//         }
//       }

//       try {
//         const authStatus = await messaging().requestPermission();
//         const enabled =
//           authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//           authStatus === messaging.AuthorizationStatus.PROVISIONAL;

//         if (enabled) {
//           const token = await messaging().getToken();
//           console.log('FCM Token:===>', token);
//           setFcmToken(token);
         
//         }
//       } catch (error) {
//         console.error('Failed to get permission or FCM token:', error);
//       }
//     };

//     requestUserPermission();
//   }, []);

//   useEffect(() => {
//     const backgroundMessageHandler = async (remoteMessage) => {
//       console.log('Message handled in the background!', remoteMessage);
//     };

//     // Ensure we directly pass the handler function
//     messaging().setBackgroundMessageHandler(backgroundMessageHandler);
//   }, []);

//   return (
//     <FirebaseContext.Provider value={{ fcmToken }}>
//       {children}
//     </FirebaseContext.Provider>
//   );
// };

// export default FirebaseProvider;


import React, { createContext, useState, useEffect, useContext } from 'react';
import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';

const FirebaseContext = createContext();

export const useFirebase = () => useContext(FirebaseContext);

const FirebaseProvider = ({ children }) => {
  const [fcmToken, setFcmToken] = useState(null);

  // Function to request user notification permission and get the FCM token
  const requestUserPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Notification permission denied');
        return;
      }
    }

    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        const token = await messaging().getToken();
        setFcmToken(token);
        console.log('FCM Token:', token);
      }
    } catch (error) {
      console.error('Failed to get permission or FCM token:', error);
    }
  };

  useEffect(() => {
    // Request permission and get the FCM token when the component mounts
    requestUserPermission();

    // Listen for token refresh
    const unsubscribe = messaging().onTokenRefresh(token => {
      setFcmToken(token);
      console.log('FCM Token refreshed:', token);
    });

    // Clean up listener on unmount
    return () => unsubscribe();
  }, []);

  return (
    <FirebaseContext.Provider value={{ fcmToken }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export default FirebaseProvider;


