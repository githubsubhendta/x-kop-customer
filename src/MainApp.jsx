import React, { useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import userStoreAction from './stores/user.store.js';
import MainStack from './navigation/MainStack.js';

const MainApp = () => {
    const {handlewhatwedoAction, addOnboardStatus, addLocalTokens} =
    userStoreAction(state => state);
  const localDataFetch = async () => {
    try {
      const [onboard, whatwe_do, Auth_data] = await AsyncStorage.multiGet([
        'onboarding_screen',
        'whatwedo',
        'Authorized_data',
      ]);
      if (onboard[1] != null) {
        addOnboardStatus(true);
      } else {
        addOnboardStatus(false);
      }

      if (whatwe_do[1] != null) {
        handlewhatwedoAction(true);
      } else {
        handlewhatwedoAction(false);
      }

      if (Auth_data[1] != null) {
        addLocalTokens(JSON.parse(Auth_data[1]));
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    localDataFetch();
  }, []);

  return (
     <MainStack />
  )
}

export default MainApp