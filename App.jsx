import React, {useState, useEffect, useRef} from 'react';
import notifee from '@notifee/react-native';7
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
import { NetworkProvider } from './src/shared/NetworkProvider.js';



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


  useEffect(() => {
  const checkInitialNotification = async () => {
    try {
      const initialNotification = await notifee.getInitialNotification();
      if (initialNotification) {
        const { pressAction, notification } = initialNotification;
        if (pressAction?.id === 'answer' && notification?.data) {
          console.log('[App] Answer button pressed on cold start');

          const useCallStore = require('./src/stores/call.store.js').default;
          useCallStore.getState().setBackgroundCallPayload(notification.data);
        }
      }
    } catch (error) {
      console.error('Error checking initial notification:', error);
    }
  };

  checkInitialNotification();
}, []);


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


  return (
    
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        isReadyRef.current = true;
        processNavigationQueue();
      }}>
    <NetworkProvider>
      <SafeAreaView style={{flex: 1}}>
        <SnackbarProvider>
          <LoadingProvider>
            <MainApp />
          </LoadingProvider>
        </SnackbarProvider>
      </SafeAreaView>
      </NetworkProvider>
    </NavigationContainer>
    
  );
}

export default App;
