import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useCall } from '../../context/callContext.js';
import { SvgXml } from 'react-native-svg';
import { SVG_hangout_red } from '../../utils/SVGImage.js';
import { useNavigationState } from '@react-navigation/native';
import { useCallDuration } from '../../shared/CallDurationContext.js';


const CallPopup = () => {
  const { activeCall, isMinimized, maximizeCall, endCall } = useCall();
const { callDuration } = useCallDuration();


  const currentRouteName = useNavigationState(state => {
    if (!state || !state.routes || state.index == null) return null;

    const route = state.routes[state.index];

    if (route.state && route.state.routes && route.state.index != null) {
      const nestedRoute = route.state.routes[route.state.index];
      return nestedRoute.name;
    }

    return route.name;
  });

  useEffect(() => {
    if (!activeCall) {
      console.log('Call disconnected, closing popup');
    }
  }, [activeCall]);

  if (
    !activeCall ||
    currentRouteName === 'AudioScreen' ||
    currentRouteName === 'VideoCallScreen'
  ) {
    return null;
  }
 

  return (
    <TouchableOpacity style={styles.popupContainer} onPress={maximizeCall}>
      <View style={styles.popupContent}>
        <View style={styles.callInfo}>
          <Text style={styles.callerName}>
            {activeCall.reciever_data?.userInfo?.name || 'On Call'}
          </Text>
          <Text style={styles.callDuration}>{callDuration}</Text>
        </View>

        <TouchableOpacity onPress={endCall}>
          <SvgXml xml={SVG_hangout_red} width={40} height={40} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  popupContainer: {
    position: 'absolute',
    top: 5,
    left: 10,
    right: 10,
    zIndex: 1000,
  },
  popupContent: {
    flexDirection: 'row',
    width: '50%',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#075E54',
    paddingHorizontal: 10,
    borderRadius: 8,
    elevation: 5,
  },
  callInfo: {
    flex: 1,
  },
  callerName: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  callDuration: {
    color: 'white',
    fontSize: 10,
    marginTop: 2,
  },
  
});

export default CallPopup;
