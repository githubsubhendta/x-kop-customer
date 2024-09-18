import React, {useState, useEffect, useRef} from 'react';
import {SafeAreaView, PermissionsAndroid, Platform} from 'react-native';
import {AppState} from 'react-native';
import themeStore from './src/stores/theme.store.js';
import 'react-native-gesture-handler';
import {LoadingProvider} from './src/shared/LoadingProvider.jsx';
import MainApp from './src/MainApp.jsx';
import {NavigationContainer} from '@react-navigation/native';
import {
  navigationRef,
  isReadyRef,
  processNavigationQueue,
} from './src/navigation/NavigationService.js';
import {
  notificationListeners,
  requestUserPermission,
} from './src/utils/notificationService.js';
import {SnackbarProvider} from './src/shared/SnackbarProvider.js';

function App() {
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const {addAppState} = themeStore(state => state);

  useEffect(() => {
    return () => {
      isReadyRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (isReadyRef.current) {
      processNavigationQueue();
    }
  }, [isReadyRef.current]);

  // useEffect(()=>{
  //   if(Platform.OS=="android"){
  //     PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS).then(res=>{
  //       console.log("notification permission done.");
  //       if(!!res && res=="granted"){
  //         requestUserPermission();
  //         notificationListeners();
  //       }
  //     }).catch(error=>console.log("notification permission problem"));
  //   }

  // },[])

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App has come to the foreground!');
      }
      appState.current = nextAppState;
      setAppStateVisible(appState.current);
      console.log('AppState', appState.current);
      addAppState(appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // useEffect(() => {

  //   const unsubscribe = messaging().onMessage(async remoteMessage => {
  //     const { notification, data } = remoteMessage;

  //   });

  //   messaging().setBackgroundMessageHandler(async remoteMessage => {
  //     console.log('Message handled in the background!', remoteMessage);

  //   });

  //   return () => {
  //     unsubscribe();
  //   };
  // }, []);

  // const handleAnswerCall = (data) => {
  //   Alert.alert('Call Answered', `Caller ID: ${data.callerId}`);
  //   // Navigate to call screen or start the call
  // };

  // const handleDeclineCall = (data) => {
  //   Alert.alert('Call Declined', `Caller ID: ${data.callerId}`);
  //   // End the call or take other appropriate action
  // };

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        isReadyRef.current = true;
        processNavigationQueue();
      }}>
      <SafeAreaView style={{flex: 1}}>
        <SnackbarProvider>
          <LoadingProvider>
            <MainApp />
          </LoadingProvider>
        </SnackbarProvider>
      </SafeAreaView>
    </NavigationContainer>
  );
}

export default App;
