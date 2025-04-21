import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from 'react';
import {navigate, reset} from '../navigation/NavigationService.js';
import {
  createAgoraRtcEngine,
  ChannelProfileType,
  ClientRoleType,
} from 'react-native-agora';
import {useWebSocket} from '../shared/WebSocketProvider.jsx';
import {useCallDuration} from '../shared/CallDurationContext.js';
import {Alert} from 'react-native';

const CallContext = createContext();

export const CallProvider = ({children}) => {
  const [activeCall, setActiveCall] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const engine = useRef(null);
  const {leave, webSocket} = useWebSocket();
  const {startCall: sttartCall, stopCall, isBalanceZero} = useCallDuration();
  // const [allInfo, setAllInfo] = useState(null);
  const isVideoEnabled = useRef(null);
  const currentActiveUserData = useRef(null);

  const [peerIds, setPeerIds] = useState([]);
  const [isJoined, setIsJoined] = useState(false);
  const APP_ID = '1be639d040da4a42be10d134055a2abd';
  const init = async config => {
    try {
      engine.current = createAgoraRtcEngine();
      engine.current.registerEventHandler({
        onJoinChannelSuccess: () => {
          // onJoinSuccess(config.channelName);
          setIsJoined(true);
        },
        onUserJoined: (_connection, Uid) => {
          // onUserJoined(Uid);
          setPeerIds(prev => [...prev, Uid]);
        },
        onUserOffline: (_connection, Uid) => {
          // onUserOffline(Uid);
          setPeerIds(prev => prev.filter(id => id !== Uid));
        },
        onError: err => {
          console.log('check error');
          // onError(err);
        },
      });

      engine.current.initialize({
        appId: APP_ID,
        channelProfile: ChannelProfileType.ChannelProfileCommunication,
      });
      await engine.current.setDefaultAudioRouteToSpeakerphone(true);

      // if (config?.video) {
      //   engine.current.enableVideo();
      //   engine.current.startPreview();
      //   isVideoEnabled.current = 'VIDEO';
      // } else {
      //   engine.current.enableAudio();
      //   engine.current.disableVideo();
      //   isVideoEnabled.current = 'AUDIO';
      // }

      if (config?.video) {
        engine.current.enableVideo();
        engine.current.startPreview();
        isVideoEnabled.current = 'VIDEO';
        console.log('Video enabled');
      } else {
        engine.current.enableAudio();
        engine.current.disableVideo();
        isVideoEnabled.current = 'AUDIO';
        console.log('Audio only');
      }
      

      await engine.current.joinChannel(
        config.config.token,
        config.config.channelName,
        config.config.uid,
        {clientRoleType: ClientRoleType.ClientRoleBroadcaster},
      );
    } catch (error) {
      console.log('error===', error);
      // onError(error);
    }
  };

  useEffect(() => {
    if (isBalanceZero) {
      endCall();
    }
  }, [isBalanceZero, endCall]);

  useEffect(() => {
    if (
      currentActiveUserData.current &&
      currentActiveUserData.current?.reciever_data?.userInfo?.mobile
    ) {
      const startTime = new Date(
        currentActiveUserData.current.reciever_data.consultationData.startCallTime,
      );
      sttartCall(
        startTime,
        currentActiveUserData.current.consultType,
        currentActiveUserData.current.reciever_data.userInfo.mobile,
        webSocket,
      );
    }
    return () => {
      stopCall();
    };
  }, [currentActiveUserData.current, webSocket]);

  const switchToVideoCall = async () => {
    if (engine.current) {
      try {
        await engine.current.enableVideo();
        await engine.current.startPreview();
        isVideoEnabled.current = 'VIDEO';
      } catch (error) {
        console.log('Error switching to video call:', error);
      }
    }
  };

  const switchToAudioCall = async () => {
    if (engine.current) {
      try {
        await engine.current.enableAudio();
        await engine.current.disableVideo();
        isVideoEnabled.current = 'AUDIO';
      } catch (error) {
        console.log('Error switching to video call:', error);
      }
    }
  };

  const startCall = async callData => {
    currentActiveUserData.current = callData;
    init(callData);
    // setAllInfo(callData);

    setActiveCall({...callData});
    setIsMinimized(false);
  };

  const handleNavigationStateChange = routeName => {
    console.log('back screen ==', routeName);
    if (activeCall) {
      if (routeName === 'AudioScreen' || routeName === 'VideoCallScreen') {
        setIsMinimized(false);
      } else {
        setIsMinimized(true);
      }
    }
  };

  const minimizeCall = () => {
    setIsMinimized(true);
  };

  const maximizeCall = () => {
    if (activeCall) {
      navigate('AudioScreen', activeCall);
      setIsMinimized(false);
    }
  };

  const endCall = async () => {
    if (engine.current) {
      await engine.current.leaveChannel();
      engine.current.release();
      engine.current = null;
    }
    stopCall();
    setActiveCall(null);
    setIsMinimized(false);
    setPeerIds([]);
    setIsJoined(false);
    leave();
  };

  useEffect(() => {
    if (!webSocket) return;

    const handleHandsup = () => {
      endCall();
      reset(0, [{name: 'LayoutScreen'}]);
    };
    webSocket.on('appyHandsup', handleHandsup);
    return () => {
      webSocket.off('appyHandsup', handleHandsup);
    };
  }, [webSocket]);
  return (
    <CallContext.Provider
      value={{
        activeCall,
        isMinimized,
        engine,
        handleNavigationStateChange,
        peerIds,
        isJoined,
        startCall,
        minimizeCall,
        maximizeCall,
        endCall,
        switchToVideoCall,
        switchToAudioCall,
        isVideoEnabled,
      }}>
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);
