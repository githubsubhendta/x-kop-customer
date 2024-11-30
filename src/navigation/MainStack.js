// import React, { useEffect } from 'react';
// import { createStackNavigator } from '@react-navigation/stack';
// import AuthStack from './AuthStack';
// import AppStack from './AppStack';
// import useCheckUser from './../hooks/useCheckUser';
// import { useLoading } from '../shared/LoadingProvider';

// const Stack = createStackNavigator();

// const MainStack = () => {
//   const { isLoggedIn,loading, onboardStatus, whatwedoStatus } = useCheckUser();
//   const { showLoading, hideLoading } = useLoading();
//   useEffect(() => {
//     if (loading || onboardStatus == null || whatwedoStatus == null) {
//       showLoading();
//     } else {
//       hideLoading();
//     }
//   }, [loading, onboardStatus, whatwedoStatus, showLoading, hideLoading]);
 
//   if (loading || onboardStatus == null || whatwedoStatus == null) {
//     return null; 
//   }

//   return (
//     <Stack.Navigator>
//       {isLoggedIn ? (
//         <Stack.Screen
//           name="AppStack"
//           component={AppStack}
//           options={{ headerShown: false }}
//         />
//       ) : (
//         <Stack.Screen
//           name="AuthStack"
//           component={AuthStack}
//           options={{ headerShown: false }}
//         />
//       )}
//     </Stack.Navigator>
//   );
// };

// export default MainStack;


import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import SplashScreen from './../screen/Splash.Screen'; // Import the Splash Screen
import useCheckUser from './../hooks/useCheckUser';
import { useLoading } from '../shared/LoadingProvider';

const Stack = createStackNavigator();

const MainStack = () => {
  const { isLoggedIn, loading, onboardStatus, whatwedoStatus } = useCheckUser();
  const { showLoading, hideLoading } = useLoading();

  // useEffect(() => {
  //   if (loading || onboardStatus == null || whatwedoStatus == null) {
  //     showLoading();
  //   } else {
  //     hideLoading();
  //   }
  // }, [loading, onboardStatus, whatwedoStatus, showLoading, hideLoading]);
 
  const [minTime,setMinTime] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTime(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (loading || onboardStatus == null || whatwedoStatus == null || minTime) {
    return <SplashScreen />;
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


