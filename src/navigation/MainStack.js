import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import useCheckUser from './../hooks/useCheckUser';
import { useLoading } from '../shared/LoadingProvider';

const Stack = createStackNavigator();

const MainStack = () => {
  const { isLoggedIn,loading, onboardStatus, whatwedoStatus } = useCheckUser();
  const { showLoading, hideLoading } = useLoading();
  useEffect(() => {
    if (loading || onboardStatus == null || whatwedoStatus == null) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [loading, onboardStatus, whatwedoStatus, showLoading, hideLoading]);
 
  if (loading || onboardStatus == null || whatwedoStatus == null) {
    return null; 
  }

  return (
    <Stack.Navigator>
      {isLoggedIn ? (
        <Stack.Screen
          name="AppStack"
          component={AppStack}
          options={{ headerShown: false }}
        />
      ) : (
        <Stack.Screen
          name="AuthStack"
          component={AuthStack}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
};

export default MainStack;

