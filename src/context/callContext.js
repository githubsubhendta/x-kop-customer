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



const CallContext = createContext();

export const CallProvider = ({children}) => {
  const [activeCall, setActiveCall] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const engine = useRef(null);
  const {leave, webSocket} = useWebSocket();

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

      if (config?.video) {
        engine.current.enableVideo();
        engine.current.startPreview();
      } else {
        engine.current.enableAudio();
        engine.current.disableVideo();
      }

      await engine.current.joinChannel(
        config.token,
        config.channelName,
        config.uid,
        {clientRoleType: ClientRoleType.ClientRoleBroadcaster},
      );
    } catch (error) {
      console.log('error===', error);
      // onError(error);
    }
  };

  const startCall = async callData => {
    init(callData.config);
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
      setIsMinimized(false);
      navigate('AudioScreen', activeCall);
    }
  };

  const endCall = async () => {
    if (engine.current) {
      await engine.current.leaveChannel();
      engine.current.release();
      engine.current = null;
    }
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
      }}>
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);
