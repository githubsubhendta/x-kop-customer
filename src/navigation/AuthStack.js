import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import OnboardingScreen from './../screen/Onboarding.Screen';
import LoginScreen from './../screen/Login.Screen';
import SignUpScreen from './../screen/Signup.Screen';
import VerifyCodeScreen from './../screen/VerifyCode.Screen';
import useCheckUser from '../hooks/useCheckUser';
const Stack = createStackNavigator();
const AuthStack = () => {

const {onboardStatus } = useCheckUser();


  return (
  <Stack.Navigator
  initialRouteName={!onboardStatus?"OnboardingScreen":"LoginScreen"}
   screenOptions={{ headerShown: false }}>
    <Stack.Screen name="OnboardingScreen" component={OnboardingScreen} options={{ headerShown: false }} />
    <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
    <Stack.Screen name="SignUpScreen" component={SignUpScreen} options={{ headerShown: false }} />
    <Stack.Screen name="VerifyCodeScreen" component={VerifyCodeScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
)};

export default AuthStack;
