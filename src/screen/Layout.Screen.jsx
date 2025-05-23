import React, {useEffect, useState} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from './Home.Screen';
import ScheduleScreen from './Schedule.Screen';
import AccountScreen from './Account.Screen';
import {
  SVG_Home,
  SVG_calender,
  SVG_person,
  SVG_chat,
} from '../utils/SVGImage.js';
import {SvgXml} from 'react-native-svg';
import {View, BackHandler, Alert, TouchableOpacity, Text} from 'react-native';
import ContactScreen from './Contact.Screen.jsx';
import {useNetwork} from '../shared/NetworkProvider.js';
import {useCall} from '../context/callContext.js';
import {navigate, reset} from '../navigation/NavigationService.js';

const Tab = createBottomTabNavigator();

const LayoutScreen = ({navigation}) => {
  const {handleNavigationStateChange} = useCall();
  const [selectedTab, setSelectedTab] = useState('Home');
  useEffect(() => {
    const backAction = () => {
      const state = navigation.getState();
      const currentRoute = state.routes[state.index].name;

      const tbArray = ['AudioScreen', 'VideoCallScreen'];

      handleNavigationStateChange(currentRoute);
      if (currentRoute === 'LayoutScreen' && selectedTab !== 'Home') {
        navigate('Home');
        handleTabPress('Home');
      } else if (selectedTab === 'Home') {
        if (tbArray.includes(currentRoute)) {
          reset(0, [{name: 'LayoutScreen'}]);
          return;
        }
        Alert.alert('Exit App', 'Do you want to exit the app?', [
          {
            text: 'Cancel',
            onPress: () => null,
            style: 'cancel',
          },
          {
            text: 'Exit',
            onPress: () => {
              BackHandler.exitApp();
            },
          },
        ]);
      } else {
        navigation.goBack();
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, [navigation, selectedTab]);

  const handleTabPress = tabName => {
    setSelectedTab(tabName);
  };

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({route}) => ({
        tabBarActiveTintColor: 'red',
        headerShown: false,
        tabBarStyle: {
          height: 50,
          paddingHorizontal: 5,
          paddingTop: 0,
          position: 'absolute',
          backgroundColor: 'transparent',
        },
      })}
      tabBar={props => (
        <TabBarWithBorder {...props} selectedTab={selectedTab} />
      )}>
      <Tab.Screen
        name="Home"
        children={() => <HomeScreen handleTabPress={handleTabPress} />}
        listeners={{
          tabPress: () => handleTabPress('Home'),
        }}
        options={{
          headerShown: false,
          tabBarIcon: ({color}) => (
            <View>
              <SvgXml xml={SVG_Home} width="100px" height="30px" />
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen
        name="Contact"
        component={ContactScreen}
        listeners={{
          tabPress: () => handleTabPress('Contact'),
        }}
        options={{
          headerShown: false,
          tabBarIcon: ({color}) => (
            <View>
              <SvgXml xml={SVG_chat} width="100px" height="30px" />
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen
        name="Schedule"
        component={ScheduleScreen}
        listeners={{
          tabPress: () => handleTabPress('Schedule'),
        }}
        options={{
          headerShown: false,
          unmountOnBlur: true,
          tabBarIcon: ({color}) => (
            <View>
              <SvgXml xml={SVG_calender} width="100px" height="30px" />
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        listeners={{
          tabPress: () => handleTabPress('Account'),
        }}
        options={{
          headerShown: false,
          tabBarIcon: ({color}) => (
            <View>
              <SvgXml xml={SVG_person} width="100px" height="30px" />
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
    </Tab.Navigator>
  );
};

const TabBarWithBorder = ({state, descriptors, navigation, selectedTab}) => {
  const {isConnected} = useNetwork();

  return (
    <>
      <View style={{flexDirection: 'row'}}>
        {state.routes.map((route, index) => {
          const {options} = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={index}
              onPress={onPress}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: 8,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <View>
                  {options.tabBarIcon({color: isFocused ? 'red' : 'black'})}
                  {route.name === selectedTab && (
                    <View className="bg-orange-900 rounded-tl-full rounded-tr-full mt-1 mx-4 w-26 h-2 text-center flex flex-row justify-center" />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      {!isConnected && (
        <Text
          style={{
            paddingVertical: 8,
            color: 'white',
            marginTop: 4,
            textAlign: 'center',
            backgroundColor: 'red',
          }}>
          No Internet Connection
        </Text>
      )}
    </>
  );
};

export default LayoutScreen;
