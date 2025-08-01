import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import LayoutScreen from './../screen/Layout.Screen.jsx';
import WhatWeDoScreen from './../screen/WhatWeDo.Screen.jsx';
import FindAnOfficerScreen from './../screen/FindAnOfficer.Screen.jsx';
import AudioScreen from './../screen/videoCall/AudioScreen.jsx';
// import VideoCallScreen from './../screen/videoCall/VideoCallScreen.jsx';
import TransactionsScreen from './../screen/profile/Transactions.Screen.jsx';
import SelectConsultantsScreen from './../screen/SelectConsultants.Screen.jsx';
import EditProfile from './../screen/profile/EditProfile.jsx';
import WalletScreen from './../screen/profile/WalletScreen.jsx';
import useCheckUser from '../hooks/useCheckUser.js';
import FirebaseProvider from '../shared/FirebaseProvider.jsx';
import {WebSocketProvider} from '../shared/WebSocketProvider.jsx';
import ParantWrapperProvider from '../shared/ParantWrapperProvider.jsx';
import ChatScreen from '../screen/Chat.Screen.jsx';
import {CallDurationProvider} from '../shared/CallDurationContext.js';
import ScheduleScreen from '../screen/Schedule.Screen.jsx';
import Reschedule from '../screen/Reschedule.Screen.jsx';
import CallPopup from '../Components/callPopup/FloatingCallPopup.jsx';
import {CallProvider} from '../context/callContext.js';
import RequestMeetingScreen from '../screen/RequestMeetingScreen.jsx';

const Stack = createStackNavigator();

const AppStack = () => {
  const {whatwedoStatus} = useCheckUser();

  return (
    <FirebaseProvider>
      <WebSocketProvider>
        <ParantWrapperProvider>
          <CallDurationProvider>
            <CallProvider>
              <CallPopup />
              <Stack.Navigator
                initialRouteName={
                  !whatwedoStatus ? 'WhatWeDoScreen' : 'LayoutScreen'
                }
                screenOptions={{headerShown: false}}>
                <Stack.Screen
                  name="WhatWeDoScreen"
                  component={WhatWeDoScreen}
                  options={{headerShown: false}}
                />
                <Stack.Screen
                  name="LayoutScreen"
                  component={LayoutScreen}
                  options={{headerShown: false}}
                />
                <Stack.Screen
                  name="FindAnOfficerScreen"
                  component={FindAnOfficerScreen}
                  options={{headerShown: false}}
                />
                <Stack.Screen
                  name="RequestingMeetingScreen"
                  component={RequestMeetingScreen}
                  options={{headerShown: false}}
                />

                <Stack.Screen
                  name="AudioScreen"
                  component={AudioScreen}
                  options={{headerShown: false}}
                />
                

                <Stack.Screen
                  name="TransactionsScreen"
                  component={TransactionsScreen}
                  options={{headerShown: false}}
                />
                <Stack.Screen
                  name="SelectConsultantsScreen"
                  component={SelectConsultantsScreen}
                  options={{headerShown: false}}
                />
                <Stack.Screen
                  name="EditProfile"
                  component={EditProfile}
                  options={{headerShown: false}}
                />

                <Stack.Screen
                  name="WalletScreen"
                  component={WalletScreen}
                  options={{headerShown: false}}
                />

                <Stack.Screen
                  name="ChatScreen"
                  component={ChatScreen}
                  options={{headerShown: false}}
                />

                <Stack.Screen
                  name="ScheduleScreen"
                  component={ScheduleScreen}
                  options={{headerShown: false}}
                />
                <Stack.Screen
                  name="Reschedule"
                  component={Reschedule}
                  options={{headerShown: false}}
                />
              </Stack.Navigator>
            </CallProvider>
          </CallDurationProvider>
        </ParantWrapperProvider>
      </WebSocketProvider>
    </FirebaseProvider>
  );
};

export default AppStack;
